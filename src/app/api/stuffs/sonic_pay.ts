/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/sonic_pay.json`.
 */
export type SonicPay = {
    "address": "5ki5s2a4kKwHovE6VwT28dUFmRhSFjmmPBVAr8tezVCd",
    "metadata": {
      "name": "sonicPay",
      "version": "0.1.0",
      "spec": "0.1.0",
      "description": "Created with Anchor"
    },
    "instructions": [
      {
        "name": "fundGasPool",
        "discriminator": [
          73,
          79,
          183,
          131,
          76,
          99,
          151,
          49
        ],
        "accounts": [
          {
            "name": "gasPool",
            "writable": true
          },
          {
            "name": "funder",
            "writable": true,
            "signer": true
          },
          {
            "name": "authority",
            "signer": true,
            "relations": [
              "gasPool"
            ]
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      },
      {
        "name": "initialize",
        "discriminator": [
          175,
          175,
          109,
          31,
          13,
          152,
          155,
          237
        ],
        "accounts": [
          {
            "name": "gasPool",
            "writable": true,
            "signer": true
          },
          {
            "name": "authority",
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
            "name": "initialBalance",
            "type": "u64"
          }
        ]
      },
      {
        "name": "sponsorGas",
        "discriminator": [
          90,
          14,
          0,
          28,
          211,
          170,
          114,
          143
        ],
        "accounts": [
          {
            "name": "gasPool",
            "writable": true
          },
          {
            "name": "user",
            "writable": true
          },
          {
            "name": "relayer",
            "writable": true,
            "signer": true
          },
          {
            "name": "authority",
            "signer": true,
            "relations": [
              "gasPool"
            ]
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "gasAmount",
            "type": "u64"
          }
        ]
      }
    ],
    "accounts": [
      {
        "name": "gasPool",
        "discriminator": [
          41,
          29,
          229,
          57,
          24,
          152,
          210,
          34
        ]
      }
    ],
    "errors": [
      {
        "code": 6000,
        "name": "insufficientFunds",
        "msg": "Not enough funds in the gas pool."
      },
      {
        "code": 6001,
        "name": "unauthorized",
        "msg": "Unauthorized access."
      }
    ],
    "types": [
      {
        "name": "gasPool",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "authority",
              "type": "pubkey"
            },
            {
              "name": "balance",
              "type": "u64"
            }
          ]
        }
      }
    ]
  };
  