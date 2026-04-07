# My Supabase journey.

Supabase is a Software as a service (Saas). It is an already made backend that allows developers build a backend easily. Unlike express, you dont have full control. You can only build on already made templates.

# HOW TO START SUPABASE

1. Start by creating an account on supabase.
2. Create a project. Note: While using a free account, you can only create two policies
3. Go to your terminal and run "npx expo install @supabase/supabase-js @rneui/themed expo-sqlite"
4. Create a supabse file in any folder of your choice. I did mine in utils folder.
5. In the .env file, add the supabase url and public key. DO NOT PUT SERVICE ROLE KEY ON THE FRONTEND!!!
6. Create a table and just play around with it., using the INSERT, SELECT, UPDATE and DELETE commands.

# SUPABASE AUTHENTICATION

Supabase Auth provides a complete identity system without needing a custom backend. Based on this project, here is how the authentication flow works:

### 1. Types of Authentication Used

- **Anonymous Sign-In**: Allows users to interact with the app immediately. In `Home.tsx`, we distinguish between "new" and "returning" guests by checking the `created_at` timestamp.
- **Magic Links (Passwordless)**: Handled in `signUp.tsx` using `supabase.auth.signInWithOtp`. This sends a secure link to the user's email.
- **Email & Password**: Handled in `login.tsx` using `supabase.auth.signInWithPassword`.

### 2. The "Upgrade" Flow

One of the most powerful features implemented in this app is the ability to "link" or upgrade an anonymous user.

- When a guest decides to sign up, we call `signInWithOtp` while they still have an active anonymous session.
- Once they confirm their email via the magic link, their anonymous `user_id` becomes their permanent `user_id`, ensuring any data they created as a guest (like books or notes) is preserved.

### 3. Session Management

- **`getSession()`**: Used for quick checks to see if a session exists locally.
- **`getUser()`**: A more secure way to fetch the user object directly from the Supabase auth server.
- **`onAuthStateChange`**: (Implicitly handled by Expo Router/Supabase) Listeners that react when a user signs in or out to update the UI globally.

### 4. Protecting Routes and Actions

In `Home.tsx`, we prevent anonymous users from submitting data by checking `session.user.is_anonymous` and redirecting them to the Sign Up screen.

### 5. Sign Out

Use `supabase.auth.signOut()` to clear the local session and tokens. In this app, we use `router.replace("/")` after logout to ensure the user is returned to a clean state where a new anonymous session can be generated if needed.

### 6. Deep Linking

For Magic Links to work in a mobile app, you must configure `Expo-Linking` and set a `redirectTo` URL that matches your Supabase Dashboard settings (e.g., `yourapp://auth/callback`).

### 7. Error Handling Strategy

- **Validation**: Check inputs before making API calls to reduce server load.
- **Try/Catch Blocks**: Wrap asynchronous Supabase calls in try/catch to handle network failures or runtime exceptions.
- **Supabase Errors**: Always check the `{ error }` object returned by Supabase SDK methods.
- **User Feedback**: Use state variables (like `errorMessage`) to show friendly messages in the UI instead of silent console logs.

### NB:

1. - **Make sure the the prefix of the link you put in Supabse site url and redirect url is same as the one you see when you expo start your app (Metro waiting on exp://10.79.200.127:8081). It enables the magic link to locate your app. When testing using expo go.**

**Set the site url to the value in scheme in the app.json file; e.g "scheme": "supabasepractice" the site url will be "supabasepractice://" literally**

**Set two redirect url's. One will be for local testing, and the other for apk.**
_Local: "exp://10.79.200.127:8081/--/auth/callback"_
_APK: "supabasepractice://\*\*"_

2. - **"((((auth.jwt() ->> 'is_anonymous'::text))::boolean IS NOT TRUE) AND (auth.uid() IS NOT NULL))".... since an anonymous user is tagged as authenticated, the basic "allow authenticated users only" doesn't work as generally. If you want only real/permanent users, not anonymous/temporary users to be able to interact with data, use the sql query abve in the "with check box". Set the policy behaviour to be permissive**

## VERY IMPORTANT!!

1. _AuthContext_
   AuthContext is the container. Think of it as a global variable that any screen can tap into.
   AuthProvider wraps your entire app (you put it in \_layout.tsx). It does 3 things on boot:

Calls getSession() to load any saved session from AsyncStorage (so the user stays logged in after closing the app)
Sets up onAuthStateChange to listen for any future auth events — login, logout, token refresh — and updates state automatically
Exposes signInAnonymously and signOut so any screen can trigger auth actions.

2. _AuthCallback_
   **This screen has one job: exchange the magic link URL for a real Supabase session.**
   This is where the magic link lands on.
   _The flow_
   On mount — waits 300ms, then calls handleCallback(). The delay is intentional: it gives the root \_layout.tsx time to capture the deep link URL before this screen tries to read it.
   handleCallback() runs through a chain of checks:
   _Get URL from \_layout_ → null? show error, redirect to login
   _Split off the fragment (#)_ → no fragment? show error, redirect to login
   **Parse access_token/refresh_token from fragment**
   _Check for error params_ → has error? show it, redirect to login
   _Check tokens exist_ → missing? show error, redirect to login
   _Call supabase.auth.setSession()_ → creates a live session from the tokens
   → failed? show error, redirect to login
   _Clear the stored URL_ → so it can't be replayed next app open
   _Navigate to /auth/password_ → user is now authenticated, go set a password

The UI just shows whatever status string is current — a spinner while working, a ⚠️ icon if anything goes wrong, and the message auto-redirects to login after 2.5 seconds on any error so the user is never stuck.

**One thing to know**
This screen is completely passive — it doesn't do any networking itself beyond setSession(). All the heavy lifting (capturing the URL, registering listeners) was done upstream in \_layout.tsx. This screen just reads the result.
