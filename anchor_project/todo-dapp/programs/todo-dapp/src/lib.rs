use anchor_lang::prelude::*;
use anchor_lang::solana_program::hash;

declare_id!("CMTzqVU6BRtBLWzDvkrXhHcT2ZvJteKydwZ29LkwrYmJ");

const MAX_DESCRIPTION_LENGTH: usize = 500;
const MIN_DESCRIPTION_LENGTH: usize = 5;

#[program]
pub mod todo_dapp {
    use super::*;

    pub fn create_task(ctx: Context<CreateTask>, description: String) -> Result<()> {
        validate_description_length(&description)?;

        let task = &mut ctx.accounts.task;
        task.user = *ctx.accounts.user.key;
        task.description = description.clone();
        task.completed = false;
        task.created_at = Clock::get()?.unix_timestamp; // Set creation time

        let task_description = &mut ctx.accounts.task_description;
        if task_description.description == description {
            return Err(ErrorCode::TaskAlreadyExists.into());
        }

        task_description.description = description;
        Ok(())
    }

    pub fn complete_task(ctx: Context<CompleteTask>, completed: bool) -> Result<()> {
        let task = &mut ctx.accounts.task;
        if task.completed && completed {
            return Err(ErrorCode::TaskAlreadyCompleted.into());
        }
        task.completed = completed;
        Ok(())
    }

    pub fn delete_task(ctx: Context<DeleteTask>) -> Result<()> {
        let task = &mut ctx.accounts.task;
        if **task.to_account_info().lamports.borrow() == 0 {
            return Err(ErrorCode::TaskAlreadyDeleted.into());
        }
        task.close(ctx.accounts.user.to_account_info())?;
        Ok(())
    }
}

fn validate_description_length(description: &String) -> Result<()> {
    match description.chars().count() {
        len if len > MAX_DESCRIPTION_LENGTH => Err(ErrorCode::DescriptionTooLong.into()),
        len if len < MIN_DESCRIPTION_LENGTH => Err(ErrorCode::DescriptionTooShort.into()),
        _ => Ok(()),
    }
}

#[derive(Accounts)]
#[instruction(description: String)]
pub struct CreateTask<'info> {
    #[account(init, payer = user, space = 8 + 32 + 4 + MAX_DESCRIPTION_LENGTH + 1)]  // 8 discriminator + 32 Pubkey + 4 length of description + 500 description + 1 bool
    pub task: Account<'info, Task>,
    #[account(
    init,
    seeds = [b"task_description", &description_seed(&description)],
    bump,
    payer = user,
    space = 8 + 4 + MAX_DESCRIPTION_LENGTH
    )]  // 8 discriminator + 4 length of description + 500 description
    pub task_description: Account<'info, TaskDescription>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

fn description_seed(description: &String) -> [u8; 16] {
    let hash = hash::hash(description.as_bytes());
    let mut seed = [0u8; 16];
    seed.copy_from_slice(&hash.to_bytes()[..16]);
    seed
}

#[derive(Accounts)]
pub struct CompleteTask<'info> {
    #[account(mut, has_one = user)]
    pub task: Account<'info, Task>,
    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct DeleteTask<'info> {
    #[account(mut, close = user, has_one = user)]
    pub task: Account<'info, Task>,
    pub user: Signer<'info>,
}

#[account]
pub struct Task {
    pub user: Pubkey,
    pub description: String,
    pub completed: bool,
    pub created_at: i64, // Unix timestamp
}

#[account]
pub struct TaskDescription {
    pub description: String,
}

#[error_code]
pub enum ErrorCode {
    #[msg("The task is already marked as completed.")]
    TaskAlreadyCompleted,
    #[msg("The task has already been deleted.")]
    TaskAlreadyDeleted,
    #[msg("The task already exists.")]
    TaskAlreadyExists,
    #[msg("The task description is too long.")]
    DescriptionTooLong,
    #[msg("The task description is too short.")]
    DescriptionTooShort,
}
