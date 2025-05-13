/**
 * Initial database schema migration
 * Creates the basic tables for the Beforest Bespoke Engine:
 * - users: Employee information
 * - sessions: Assessment sessions
 * - feedback: Manager feedback on sessions
 */
exports.up = function(knex) {
  return knex.schema
    // Users table for employees and managers
    .createTable('users', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('name').notNullable();
      table.string('email').notNullable().unique();
      table.string('role').notNullable().defaultTo('employee');
      table.string('team');
      table.timestamps(true, true);
    })
    
    // Sessions table for assessment sessions
    .createTable('sessions', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.timestamp('start_time').notNullable().defaultTo(knex.fn.now());
      table.timestamp('end_time');
      table.string('status').notNullable().defaultTo('in_progress');
      table.jsonb('questions').notNullable();
      table.jsonb('answers').notNullable().defaultTo('[]');
      table.integer('total_time'); // in seconds
      table.string('email_sent_to');
      table.timestamps(true, true);
    })
    
    // Feedback table for managers to provide feedback
    .createTable('feedback', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('session_id').references('id').inTable('sessions').onDelete('CASCADE');
      table.text('feedback').notNullable();
      table.uuid('feedback_by').references('id').inTable('users').onDelete('SET NULL');
      table.timestamp('feedback_at').notNullable().defaultTo(knex.fn.now());
      table.timestamps(true, true);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('feedback')
    .dropTableIfExists('sessions')
    .dropTableIfExists('users');
}; 