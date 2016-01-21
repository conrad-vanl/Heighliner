// schema.js
import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
} from "graphql"


import { Transactions, api, parseEndpoint } from "../rock"
import AccountDetail from "./shared/rock/financial-account"

const TransactionDetails = new GraphQLObjectType({
  name: "TransactionDetails",
  description: "A NewSpring Transaction Detail Record",
  fields: () => ({
    id: {
      type: GraphQLString,
      resolve: transaction => (transaction.AccountId)
    },
    amount: {
      type: GraphQLString,
      resolve: transaction => (transaction.Amount)
    },
    date: {
      type: GraphQLString,
      resolve: transaction => (transaction.CreatedDateTime)
    },
    account: {
      type: AccountDetail,
      resolve: transaction => (transaction.Account)
    }
  })
})

const TransactionType = new GraphQLObjectType({
  name: "Transactions",
  description: "A NewSpring Transaction Record",
  fields: () => ({
    id: {
      type: GraphQLString,
      resolve: transaction => (transaction.Id)
    },
    summary: {
      type: GraphQLString,
      resolve: transaction => (transaction.Summary)
    },
    date: {
      type: GraphQLString,
      resolve: transaction => (transaction.CreatedDateTime)
    },
    details: {
      type: new GraphQLList(TransactionDetails),
      resolve: transaction => (transaction.TransactionDetails)
    }
  })
})

const finanicalTransaction = {
  type: TransactionType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLInt) },
  },
  resolve: (_, { id }) => {
    return Transactions.getOne(id)
      .then((transactions) => (transactions[0]))
  }
}

export {
  finanicalTransaction
}

export default {
  type: new GraphQLList(TransactionType),
  args: {
    personAliasId: { type: new GraphQLNonNull(GraphQLInt) },
    limit: {
      type: GraphQLInt,
      defaultValue: 20
    },
    skip: {
      type: GraphQLInt,
      defaultValue: 0
    }
  },
  resolve: (_, { personAliasId, limit, skip }) => {

    let allAccountsQuery = api.parseEndpoint(`
       FinancialAccounts?
        $expand=
          ChildAccounts
        &$filter=
          ChildAccounts/any(ca: Id ne null) or
          (Id ne null and ParentAccountId eq null)
    `)


    let allAccounts = api.get(allAccountsQuery)
    return Promise.all([Transactions.get(personAliasId, limit, skip), allAccounts])
      .then(([transactions, accounts]) => {

        let accountObj = {};

        for (let account of accounts) {

          for (let child of account.ChildAccounts) {
            child.parent = account.Id
            accountObj[child.Id] = child
          }

          delete account.ChildAccounts

          // map parent account
          accountObj[account.Id] = account
        }


        for (let transaction of transactions) {
          for (let detail of transaction.TransactionDetails) {

            let account = accountObj[detail.AccountId]
            if (account) {
              if (account.parent) {
                detail.Account = accountObj[account.parent]
                continue
              }
              detail.Account = account
            }
          }
        }

        return transactions

      })
  }
}
