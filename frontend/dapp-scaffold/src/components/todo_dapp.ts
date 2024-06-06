/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/todo_dapp.json`.
 */
export type TodoDapp = {
  "address": "CMTzqVU6BRtBLWzDvkrXhHcT2ZvJteKydwZ29LkwrYmJ",
  "metadata": {
    "name": "todoDapp",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "completeTask",
      "discriminator": [
        109,
        167,
        192,
        41,
        129,
        108,
        220,
        196
      ],
      "accounts": [
        {
          "name": "task",
          "writable": true
        },
        {
          "name": "user",
          "signer": true,
          "relations": [
            "task"
          ]
        }
      ],
      "args": [
        {
          "name": "completed",
          "type": "bool"
        }
      ]
    },
    {
      "name": "createTask",
      "discriminator": [
        194,
        80,
        6,
        180,
        232,
        127,
        48,
        171
      ],
      "accounts": [
        {
          "name": "task",
          "writable": true,
          "signer": true
        },
        {
          "name": "taskDescription",
          "writable": true
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "description",
          "type": "string"
        }
      ]
    },
    {
      "name": "deleteTask",
      "discriminator": [
        112,
        220,
        10,
        109,
        3,
        168,
        46,
        73
      ],
      "accounts": [
        {
          "name": "task",
          "writable": true
        },
        {
          "name": "user",
          "signer": true,
          "relations": [
            "task"
          ]
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "task",
      "discriminator": [
        79,
        34,
        229,
        55,
        88,
        90,
        55,
        84
      ]
    },
    {
      "name": "taskDescription",
      "discriminator": [
        24,
        23,
        39,
        0,
        60,
        84,
        62,
        183
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "taskAlreadyCompleted",
      "msg": "The task is already marked as completed."
    },
    {
      "code": 6001,
      "name": "taskAlreadyDeleted",
      "msg": "The task has already been deleted."
    },
    {
      "code": 6002,
      "name": "taskAlreadyExists",
      "msg": "The task already exists."
    },
    {
      "code": 6003,
      "name": "descriptionTooLong",
      "msg": "The task description is too long."
    },
    {
      "code": 6004,
      "name": "descriptionTooShort",
      "msg": "The task description is too short."
    }
  ],
  "types": [
    {
      "name": "task",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "completed",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "taskDescription",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "description",
            "type": "string"
          }
        ]
      }
    }
  ]
};
