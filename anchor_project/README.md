The project contains simple Todo app. 

You can create note, no shorter that 5 characters, no longer than 500, and duplicates aren't allowed

Created notes might be marked as completed or deleted - neither of these actions cannot be undone

Remember to be in proper directory: `todo-dapp/anchor_project/todo-dapp`

To build project execute:

`anchor build`

To run tests: 

`yarn install`

`anchor test`

####
- Known issues! 
####

When running tests first time on new local machine it might be needed to update `Program ID` in:

`anchor_project/todo-dapp/programs/todo-dapp/src/lib.rs` line 4 

with value that is an output of `anchor deploy`


