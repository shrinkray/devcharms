---
author: Greg Miller
datetime: 2026-10-28T12:30:00Z
title: "Why email forwarding broke"
slug: why-email-forwarding-broke
featured: true
draft: false
tags:
  - email
  - security
  - dmarc
ogImage: "/assets/why-email-forwarding-broke.png"
description: Forwarding worked for decades, then banks started bouncing it. Here's why spoofing checks break a forward, how to prove it with one command, and a way off the habit that isn't cold turkey.
---

![representation of email forwarding and bouncing back to the institution.](/assets/why-email-forwarding-broke.png)

_"My American Express e-mail used to forward. **Now it bounces!**
Everything they send me gets kicked back. Please research this."_

That was a message from a client this week, and this has been a reoccuring conversation over the past few years, since he became my client. He has forwarded his business email to a personal account for his entire working life, around 30 years. Until the 2020s, it reliably worked. Things have changed. His bank's messages bounce, and he believes his email provider is responsible for fixing the problem. When I took him on, I definately wanted to move him off of his longtime email provider, **Network Solutions**, they did not help, but their email service was not the cause of **this** problem.

A habit that worked for three decades broke, and he refuses to believe that he has to change his behavior. But it's bad business practice to forward all of your email to a personal account. It's a security risk, and it's not good for your brand. The problem isn't the mail service provider. It's the forwarding itself. It would happen with any provider, and the proof is a single command you can run in a few seconds.

## Table of contents

## What changed

Email was built on trust. Any server could claim to send mail from any address, and for a long time that mostly worked. Then phishing became a business, and banks became the favorite thing to impersonate.

The industry answered with three layers of checks, added over about fifteen years:

- **SPF** (mid-2000s): the domain publishes a list of servers allowed to send its mail. The receiver checks whether the sending server is on the list.
- **DKIM** (2007): the sender attaches a cryptographic signature to the message. The receiver checks that the message still matches it. Think of a wax seal on a letter: if the contents were changed, the seal won't match.
- **DMARC** (2012): the domain publishes a policy that says what to do when those checks fail. `p=none` means "just report it," `p=quarantine` means "send it to spam," and `p=reject` means "refuse it outright."

Adoption was slow until providers got serious. In 2014, **Yahoo** and **AOL** published `p=reject` for their own domains, and it famously broke mailing lists overnight. In 2024, Google and Yahoo started requiring authentication from bulk senders. Each step made receivers less forgiving of mail that can't prove where it came from.

That's why this "suddenly" broke. Forwarding didn't change. The rules around it did.

## Why forwarding breaks the checks

When you forward a message, you are a middleman. Your server re-sends someone else's email, and that causes two problems:

1. **SPF fails.** The message now comes from your forwarding server, which isn't on the bank's approved list.
2. **DKIM sometimes fails.** If anything in the message changes along the way (a footer, a subject tag), the seal no longer matches.

If both checks fail and the bank has told the world `p=reject`, the receiving system is doing exactly what the bank asked: refusing the message. Receivers differ in how strictly they enforce it, and **AOL** is one of the stricter ones.

There are fixes on the forwarder's side (SRS rewrites the sender address, and ARC lets a forwarder vouch for what it saw), but they depend on every system in the chain supporting them. You don't control that, and neither does your bank.

<figure>
  <img
    class="theme-img theme-img--light"
    src="/assets/bank-email-forwarding-bounce-light.png"
    alt="Amex or Chase sends directly to ModernMail, where the signature stays intact. Forwarding to AOL breaks the signature, and the rejection returns to the bank."
    width="680"
    height="270"
  />
  <img
    class="theme-img theme-img--dark"
    src="/assets/bank-email-forwarding-bounce-dark.png"
    alt="Amex or Chase sends directly to ModernMail, where the signature stays intact. Forwarding to AOL breaks the signature, and the rejection returns to the bank."
    width="680"
    height="270"
  />
  <figcaption>
    ModernMail stands in for the mailbox. Direct delivery keeps the signature.
    The forward to AOL breaks it, and the bounce goes back to the bank.
  </figcaption>
</figure>

Swap that mailbox for any other host and the check still fails. The strict receiver is what bounces it.

## Prove it with one command

Don't take my word for it. Your bank publishes its policy in public DNS. On a Mac or Linux terminal:

```bash
dig TXT _dmarc.americanexpress.com +short
dig TXT _dmarc.chase.com +short
```

On Windows:

```text
nslookup -type=TXT _dmarc.americanexpress.com
```

When I ran these, both returned `p=reject`:

```text
"v=DMARC1;p=reject;fo=1;rua=mailto:..."
"v=DMARC1; p=reject; pct=100; rua=mailto:..."
```

The `pct=100` on the second one means the policy applies to every message. These policies can change, so run the check yourself.

## Don't go cold turkey

The cleanest fix is to stop forwarding. But telling someone to abandon a 30-year habit overnight is a good way to lose their trust. Here is a staged approach that worked for this client.

1. **Deliver mail directly to a real mailbox.** Mail for the business address lands in a proper hosted mailbox first, with no forwarding step. The bank's messages arrive intact. Any decent provider works; the point is that the bank's message goes straight to the place you read it.
2. **Keep forwarding for the mail he actually wants elsewhere.** Instead of forwarding everything except the bank, flip it: forward only a short list of trusted senders (clients, family). Anything a rule misses stays in the new inbox instead of silently bouncing.
3. **Give financial accounts a private alias.** An address like `finance@yourdomain.com` that goes to the same inbox but isn't published anywhere. Point your banks to it, and write one rule that catches everything sent to that alias. It's also harder for scammers to guess or spoof.
4. **Set a review date.** After 30 days, check whether the old inbox still has anything important. Most people find they've stopped opening it.

One caution: "forward everything except the bank" looks easier, but it's fragile. Banks send from several addresses, and other organizations (payment processors, insurers, government agencies) use the same strict policies. A bounce goes to the sender, so you never see what you missed.

As a bonus, once mail is sent from the proper address, the "I may be replying from a personal device" line in a signature isn't needed anymore. What people mail to is what they get replies from. _ModernMail_ makes a great mobile app. Users may find it a better fit for their needs than a traditional, _You've got mail!_ inbox.

## Why forwarding is a security risk

A business owner owes that standard to the clients who trust the company with their money, and to the people inside the organization who have to live with the setup. Forwarding business mail into a personal inbox is a security problem. Bank alerts, invoices, and client threads land in an account the business does not control. The checks that prove a message is real get stripped on the way, and a bounce goes back to the sender, so a fraud notice can vanish without anyone at the company seeing it. Replying from a personal address also trains customers to trust mail that did not come from the company domain. That is the habit phishers count on.

The address on the door is part of the brand. When a message arrives, gets answered, and comes back from the same domain, the business looks like it is paying attention. Missed mail, bounced bank notices, and a signature that apologizes for a personal device do the opposite: they make a careful company look careless. Cleaner email protects the clients and the staff, and it makes the business easier to trust with the next invoice.

## Need help with this?

If you have a client, a family member, or your own business email forwarding through **Gmail**, **AOL**, or **Yahoo** and you're seeing bounces, spam folder surprises, or "I never got that" moments, this is a fixable problem. I help small businesses build their brand, establish stronger email security, improve their email deliverability, and more. I help clients move to reliable email, set up the DNS records (SPF, DKIM, DMARC) behind it, and make the transition gentle enough that people actually stick with it. If you want to learn more about _ModernMail_, I'm happy to share what we're using to help our clients.

<a href="https://shrinkraylabs.com/contact-me/" class="underline decoration-dashed underline-offset-8 hover:text-skin-accent"><strong>Shrinkray Interactive</strong></a> can take that handoff: the mailbox, the DNS, and a plan the person will still be using a month later.

_Facts in this post were checked against public sources on October 27, 2026. DMARC policies change, so verify with `dig` before telling a client._
