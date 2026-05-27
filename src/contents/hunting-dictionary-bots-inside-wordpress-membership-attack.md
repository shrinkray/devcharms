---
author: Greg Miller
datetime: 2026-05-27T12:00:00Z
title: "Hunting Dictionary Bots: Inside a Sophisticated WordPress Membership Attack"
slug: hunting-dictionary-bots-inside-wordpress-membership-attack
featured: true
draft: false
tags:
  - security
  - wordpress
  - automation
ogImage: "/assets/og-dictionary-bots.png"
description: Modern "dictionary bots" can bypass CAPTCHAs and WAFs to spam WordPress membership signups. Learn how the attack works—and how to block it in code.
---

![A screenshot of a WordPress membership signup form with a CAPTCHA and a WAF blocking a dictionary bot](/assets/og-dictionary-bots.png)

Automated registration spam is shifting away from traditional brute-force tactics. Standard security layers often fail against modern bot scripts that pass visual challenges and bypass baseline web application firewalls. These advanced campaigns mimic legitimate human patterns to compromise open registration endpoints.

This post examines the mechanics of **Dictionary Attack Bots**, details the concrete risks they pose to membership platform integrity, and provides implementation code to secure your user tables.

## The Membership Threat: Impact by the Numbers

Allowing automated registrations to pool in your database creates immediate operational hazards:

- **42% Database Inflation:** Automated accounts distort core engagement metrics. They skew active user KPIs, churn rates, retention tracking, and email marketing segmentation analytics.
- **Origin Server Overhead:** Bulk account creation triggers repetitive `INSERT` queries, invalidates user cache clusters, and drives high CPU utilization.
- **8.3x Email Delivery Risk:** Automated sign-ups generate high bounce rates and trigger spam complaints during onboarding automation. This degrades your transactional email domain authority and lands critical system emails in user spam folders.
- **Downstream Vulnerabilities:** Attackers weaponize these dormant accounts later for credential stuffing, automated API scraping, or content/comment injection.

---

## Anatomy of the Exploit: Dictionary Word Pairing

Traditional registration scripts rely on randomized character strings (e.g., `xj947_ktr`). Modern security filters identify and block these strings easily. To circumvent detection, this script uses coordinated dictionary pairings.

The bot engine generates identifiers by combining two distinct English dictionary terms, appended with a single or double digit: `[Noun/Adj] + [Noun] + [Digit]`. This structure targets validation suites that assume standard dictionary terms indicate human input.

Data from an active database trace reveals clear structural patterns across separate registration batches:

| User ID | Registered Username | Target Domain Name | Structural Formula          |
| :------ | :------------------ | :----------------- | :-------------------------- |
| 4372    | `basketoption7`     | `koiot.de`         | `[Noun] + [Noun] + [Digit]` |
| 3537    | `basketperch1`      | `koiot.de`         | `[Noun] + [Noun] + [Digit]` |
| 4341    | `basketriver9`      | `koiot.de`         | `[Noun] + [Noun] + [Digit]` |
| 4481    | `basketwomen0`      | `koiot.de`         | `[Noun] + [Noun] + [Digit]` |
| 4528    | `actman4`           | `koiot.de`         | `[Noun] + [Noun] + [Digit]` |
| N/A     | `adultmiddle4`      | `calculator.city`  | `[Adj] + [Noun] + [Digit]`  |
| N/A     | `actormuseum8`      | `bitingmites.org`  | `[Noun] + [Noun] + [Digit]` |

The script rotates target domains across separate waves, altering infrastructure footprints while maintaining the underlying username generation logic. The email handles often use standard human name formats (e.g., `johne@calculator.city`) to blend in with valid registrations.

---

## Defensive Engineering: Programmatic Remediation

Because these registration payloads exist entirely within the body of incoming `POST` requests, standard proxy layers cannot always parse or drop them based on payload content alone. Remediating this threat requires a defense-in-depth approach across your technical stack.

### 1. Application Layer Domain Restrictions

The fastest method for stopping active registration waves involves validating the registration array directly inside WordPress. Hooking into the `registration_errors` filter intercepts the registration process before the application executes a database transaction.

```php
/**
 * Restrict known malicious domains from creating WordPress user accounts.
 * Drops the registration request before hitting the database.
 */
add_filter('registration_errors', 'devcharms_restrict_spam_domains', 10, 3);
function devcharms_restrict_spam_domains($errors, $sanitized_user_login, $user_email) {
    $banned_domains = [
        '24faw.com',
        'igtikrenai.com',
        'koiot.de',
        'temz.net',
        'emailmin.com',
        'calculator.city'
    ];

    $email_parts = explode('@', $user_email);
    $domain      = end($email_parts);

    if (in_array(strtolower($domain), $banned_domains)) {
        $errors->add(
            'banned_domain_error',
            __('<strong>ERROR</strong>: Registration parameters rejected.')
        );
    }

    return $errors;
}
```

### 2. Remediate Existing Users (Purge the Spam Already Inside)

Once these accounts exist, blocking new registrations won’t fix the damage already done to your tables and analytics. The simplest remediation path is to go to **Admin → Users**, search by the offending domain (for example `@koiot.de`), and bulk-delete the matching accounts.

This approach (Admin UI bulk delete or WP-CLI) is almost always safer than “just deleting rows” in the database. User emails and IDs can be duplicated across core and plugin tables, and a manual DB purge can leave orphaned metadata, broken relationships, or stale activity records—especially on community sites running BuddyPress, bbPress, membership plugins, or LMS/ecommerce add-ons.

Common places these users can persist include:

- **Core WordPress**: `wp_users`, `wp_usermeta`
- **BuddyPress**: `wp_bp_activity`, `wp_bp_activity_meta`, `wp_bp_friends`, `wp_bp_groups*`, `wp_bp_notifications`, `wp_bp_messages*`, `wp_bp_xprofile*`
- **bbPress**: forum/topic/reply content in `wp_posts` plus related post meta in `wp_postmeta`
- **Other plugins**: their own custom tables and user meta keys (memberships, LMS, ecommerce, forms, etc.)

If you have WP-CLI access, you can do the same cleanup much faster from the command line by deleting users whose email matches a domain pattern:

```bash
wp user delete $(wp user list --search="*@koiot.de" --field=ID)
```
