---
lang: en
title: "What Is k-Anonymity? How Your Password Stays Private"
description: A plain-language explanation of how PW Checkup checks your password against a breach database without ever sending it to a server.
updated: 2026-09-04
order: 2
---

## Wait, why is it safe to type my password into this?

It can feel strange to type a real password into a tool that claims to check it against leaked data — surely checking requires sending it somewhere? PW Checkup uses a technique called **k-anonymity** to check your password without ever sending your actual password, or even its full hash, to any server.

## Step 1: hashed inside your browser

The moment you type a password, your browser computes its SHA-1 hash — a fixed-length string derived from the password in a way that can't be reversed. For example, `password123` becomes `CBFDAC6008F9CAB4083784CBD1874F76618D2A97`, a 40-character string. This calculation happens entirely inside your browser, instantly.

## Step 2: only the first 5 characters are sent

This is the key part. Instead of sending the full 40-character hash, only the **first 5 characters** are transmitted — in the example above, just `CBFDA`. From those 5 characters alone, the server has no way of knowing which password you're checking — hundreds to thousands of different hashes share the same first 5 characters.

## Step 3: the server returns every possible match

The server responds with the remaining 35 characters of **every** hash that starts with those same 5 characters — usually hundreds or thousands of entries. Your exact hash may or may not be somewhere in that list. From the server's perspective, there's no way to tell which of the many candidates you're actually looking for.

## Step 4: the final comparison happens locally, again

Once your browser receives that list, it compares your own full hash (all 40 characters) against every entry, locally. This comparison — and the resulting "breached" or "safe" verdict — happens entirely on your device and is never sent anywhere.

## Why is it called "anonymity"?

k-anonymity is a privacy technique that hides a specific piece of data among at least k similar-looking pieces of data, so no outside observer can tell which one is real. Here, the exact hash you're looking up is hidden among hundreds or thousands of other hashes sharing the same 5-character prefix. This exact approach was designed by Troy Hunt, the creator of Have I Been Pwned, and has become the industry-standard method for client-side password checking.

## See it for yourself

Open your browser's developer tools "Network" tab and [check a password on PW Checkup](/en/). You'll see the request to `api.pwnedpasswords.com` contains only a 5-character string, and the response is a multi-line list of hash suffixes — nothing more.
