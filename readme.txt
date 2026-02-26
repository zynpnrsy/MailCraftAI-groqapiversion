   to use it locally 
   
   cd /Users/zeyneppinarsoy/Desktop/codes/email-agent-vercel
   npm install


local .env yarat 
   GROQ_API_KEY=your_groq_key_here

   IMAP_HOST=imap.yourprovider.com
   IMAP_PORT=993
   SMTP_HOST=smtp.yourprovider.com
   SMTP_PORT=587
   EMAIL_USER=your-email@example.com
   EMAIL_PASS=your-email-password-or-app-password
   EMAIL_FROM=Your Name <your-email@example.com>

   server çalıştırmak için    npm run dev

   http://localhost:3000


   Deploying to Vercel
Push this project to a Git repo and import it in Vercel.
In Vercel project settings, add the same env vars (GROQ_API_KEY, IMAP_*, SMTP_*, EMAIL_*).
Vercel will detect Next.js, build, and deploy.
The same app/page.tsx UI will be available at your Vercel URL and will trigger the pipeline via the serverless API route.


In Vercel logs (or npm run dev console), filter by:
Event names: pipeline.start, agent.reader.done, agent.classifier.done, agent.response.done, agent.critic.done, pipeline.critic_rejected, pipeline.reply_sent, pipeline.error.
Fields:
classification – to debug misclassifications.
extractedUsername, extractedOrderNumber – to inspect regex extraction quality.
approved / critique – to see why the critic rejected a reply.
durationMs and totalDurationMs – to spot slow agents.

frontend kısmında 
npm install -D tailwindcss postcss autoprefixer
2- npx tailwindcss init -p
Bu 2 dosya oluşturacak:
tailwind.config.js
postcss.config.js


çalışması için
1- npm run dev 
2- localhost:3000 