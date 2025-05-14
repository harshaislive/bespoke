# Beforest Bespoke Engine - Supabase Setup

This document outlines how to set up Supabase for the Beforest Bespoke Engine application.

## 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and sign up/login
2. Create a new project
3. Give it a name and set a secure database password
4. Choose a region close to your users
5. Wait for the project to be created

## 2. Get Your Supabase Credentials

1. In your Supabase dashboard, go to Project Settings > API
2. Copy the "URL" and "anon/public" key
3. Create a `.env` file in the root of your project and add:

```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
```

## 3. Run the Database Migration

1. In the Supabase dashboard, go to the SQL Editor
2. Create a new query
3. Copy and paste the contents of the `migrations/session_table.sql` file
4. Run the query to create the required tables and triggers

## 4. Setting Up Realtime

1. In the Supabase dashboard, go to Database > Replication
2. Enable realtime for the `sessions` table
3. This allows the application to receive real-time updates when questions are added

## 5. Handling Database Events (e.g., for Question Generation & Session Completion)

The `migrations/session_table.sql` script not only creates the `sessions` table but also sets up PostgreSQL triggers that use `pg_notify` to emit events:
- `question_generator`: Emitted after a new session is inserted. Payload includes `session_id`, `name`, `email`.
- `session_completion`: Emitted when a session's `status` is updated to 'completed'. Payload includes `session_id`, `email`, `status`.

These internal database notifications can be used to trigger further actions. Here are a couple of ways to listen and react to these events:

### Option A: Using Supabase Edge Functions
You can create Supabase Edge Functions that subscribe to these `pg_notify` events.

**Example: Edge Function to listen for `question_generator` and call an external service:**

1.  In the Supabase dashboard, go to Edge Functions.
2.  Create a new function (e.g., `handle-question-generation-event`).
3.  This function would need to:
    a.  Connect to your Supabase Realtime or database event listener for `pg_notify`.
    b.  Listen for events on the `question_generator` channel.
    c.  When an event is received, extract the payload (session_id, name, email).
    d.  Optionally, make an HTTP POST request to an external question generation service (like the one specified in `REACT_APP_WEBHOOK_QUESTION_GENERATOR` in your `.env` file) using the extracted data.
    e.  Handle the response from the external service (e.g., update the session in Supabase with the generated questions).

   *Note: The specific implementation details for listening to `pg_notify` within an Edge Function would need to be developed based on Supabase's current capabilities and documentation for this pattern.*

### Option B: Application Backend Listener
Your main application backend (if separate from the React frontend) could also listen directly for these `pg_notify` events from the PostgreSQL database and trigger the necessary logic.

This `pg_notify` mechanism provides a way to decouple the initial data insertion from subsequent processing steps like question generation or sending notifications.

## 6. Testing

1. Start your application with `npm start`
2. Fill out the user info form to create a new session
3. The application should connect to Supabase, create a session, and display questions
4. Answers will be saved to Supabase as you type them
5. When you submit the assessment, the session will be marked as completed

## Troubleshooting

- **No connection to Supabase**: Check that your `.env` file is correctly set up and that your API keys are correct
- **Cannot create tables**: Make sure you have the correct permissions in your Supabase project
- **Realtime not working**: Check that the realtime feature is enabled for the sessions table
- **CORS errors**: Add your application's URL to the allowed origins in the Supabase dashboard under Auth > URL Configuration

## Next Steps

- Set up proper authentication if needed
- Create an admin dashboard to view session results
- Implement feedback functionality for managers
- Add email notifications using Supabase Edge Functions 