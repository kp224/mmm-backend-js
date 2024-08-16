import { sql } from 'drizzle-orm';
import {
  index,
  integer,
  pgEnum,
  pgTableCreator,
  text,
  timestamp,
  uuid,
  varchar
} from 'drizzle-orm/pg-core';

export const createTable = pgTableCreator((name) => `mmm_${name}`);

export const roleEnum = pgEnum('role', ['patient', 'caregiver', 'physician']);

export const users = createTable(
  'user',
  {
    id: varchar('id', { length: 256 }).notNull().primaryKey(),
    first_name: varchar('first_name', { length: 256 }).notNull(),
    last_name: varchar('last_name', { length: 256 }).notNull(),
    email: varchar('email', { length: 256 }).notNull().unique(),
    role: roleEnum('role'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull()
  },
  (example) => ({
    nameIndex: index('name_idx').on(example.first_name, example.last_name)
  })
);

export const patient_profiles = createTable('patient_profiles', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  name: varchar('name', { length: 256 }).notNull(),
  patient_id: varchar('patient_id')
    .notNull()
    .references(() => users.id),
  caregiver_id: varchar('caregiver_id').references(() => users.id),
  physician_id: varchar('physician_id').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull()
});

export const health_data = createTable('health_data', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  patient_profile_id: uuid('patient_profile_id')
    .notNull()
    .references(() => patient_profiles.id),
  submission_date: timestamp('submission_date', { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  submitter_id: varchar('submitter_id')
    .notNull()
    .references(() => users.id),
  submitter_role: text('submitter_role').notNull(),
  health: integer('health').notNull(),
  energy: integer('energy').notNull(),
  mood: integer('mood').notNull(),
  living_situation: integer('living_situation').notNull(),
  memory: integer('memory').notNull(),
  family: integer('family').notNull(),
  marriage: integer('marriage').notNull(),
  friends: integer('friends').notNull(),
  self_whole: integer('self_whole').notNull(),
  chores_ability: integer('chores').notNull(),
  fun_ability: integer('fun').notNull(),
  money: integer('money').notNull(),
  life_whole: integer('life_whole').notNull(),
  score: integer('score').notNull()
});
