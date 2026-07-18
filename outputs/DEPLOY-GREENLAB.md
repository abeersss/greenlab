# Deploy GreenLab at $0

## Files to publish

Publish every file in this folder together. `index.html` is the GreenLab home page and links to the two exercise files.

## Recommended: Cloudflare Pages

1. Create a free Cloudflare account.
2. Open **Workers & Pages** and choose **Create application**.
3. Choose **Get started** then **Drag and drop your files**.
4. Enter a project name, such as `greenlab-dr-abeer`.
5. Upload this complete `outputs` folder, or a ZIP containing its files.
6. Select **Deploy site**. Your live link will be `https://greenlab-dr-abeer.pages.dev`.

Cloudflare Pages supports direct folder or ZIP uploads and provides a free `pages.dev` address. This static GreenLab site uses no server, so hosting costs $0 while you remain within the free plan limits.

## Contact form before launch

The contact form is already designed, but it does not send messages until it is connected to a receiver.

1. Create a free Formspree account and create one form.
2. Copy its form endpoint, which looks like `https://formspree.io/f/xxxxabcd`.
3. In `index.html`, replace `<form class="form" id="contactForm">` with `<form class="form" action="YOUR_FORMSPREE_ENDPOINT" method="POST">`.
4. Remove the final JavaScript line that begins `document.getElementById('contactForm').onsubmit`.
5. Re-upload `index.html` to Cloudflare Pages.

Do not publish an email address in the page until Dr. Abeer chooses the right address for GreenLab.

## Future updates

For an update, open the Cloudflare Pages project and use **Create a new deployment** to upload the changed files. If you want automatic updates later, create a new GitHub-connected Cloudflare Pages project.
