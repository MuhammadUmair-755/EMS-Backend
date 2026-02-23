require('dotenv').config();
const { Pool } = require('pg'); // Required for the adapter
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('../generated/prisma/client');

const connectionString = `${process.env.DATABASE_URL}`;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const baseClient = new PrismaClient({ adapter });

const prisma = baseClient.$extends({
  query: {
    employee: {
      async findMany({ args, query }) {
        args.where = { 
          ...args.where, 
          status: { not: "TERMINATED" } 
        };
        return query(args);
      },
      async findFirst({ args, query }) {
        args.where = { 
          ...args.where, 
          status: { not: "TERMINATED" } 
        };
        return query(args);
      },
      async count({ args, query }) {
        args.where = { 
          ...args.where, 
          status: { not: "TERMINATED" } 
        };
        return query(args);
      },
    },
  },
});

module.exports = prisma;