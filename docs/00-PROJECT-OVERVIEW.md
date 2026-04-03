# Patient Case Tracker — Project Overview

> **Project Name:** Patient Case Tracker (CaseLog)  
> **Type:** Web Dashboard + PWA  
> **Target Users:** Doctors / Medical Practitioners  
> **Date:** 2 April 2026  
> **Status:** POC / Planning Phase

---

## What Is This?

A digital tool for doctors to log, track, and review patient cases from admission to discharge. Doctors use it to:

- Record patient details at admission
- Log events, treatments, observations, and photos throughout the stay
- Track patient progress over time (vitals, milestones, complications)
- Record discharge summary and outcomes
- Reference past cases as case studies for learning/future treatment

---

## Problem Statement

Doctors often maintain patient notes in fragmented ways — paper records, scattered digital notes, WhatsApp photos. There's no single structured tool to:

1. Log a patient journey from start to finish
2. Attach clinical photos, lab reports, and scans in context
3. Search and reference past cases for similar conditions
4. Export case data for academic presentations or peer review

---

## Document Index

| #   | Document                                                | Purpose                                             |
| --- | ------------------------------------------------------- | --------------------------------------------------- |
| 01  | [Requirements & User Stories](./01-REQUIREMENTS.md)     | Functional & non-functional requirements            |
| 02  | [Tech Stack & Architecture](./02-TECH-STACK.md)         | Technology choices, storage strategy, system design |
| 03  | [Data Model & Schema](./03-DATA-MODEL.md)               | Database schema, relationships, file storage        |
| 04  | [UX Architecture & Wireframes](./04-UX-ARCHITECTURE.md) | Page structure, user flows, wireframe specs         |
| 05  | [CSS Design System](./05-DESIGN-SYSTEM.md)              | Variables, typography, spacing, theming             |
| 06  | [MVP Scope & Phases](./06-MVP-SCOPE.md)                 | What to build first, phased rollout plan            |
| 07  | [POC Sharing Strategy](./07-POC-STRATEGY.md)            | How to share with doctors for feedback              |
| 08  | [Package List & Setup](./08-PACKAGES.md)                | NPM packages, Firebase config, dev setup            |

---

## Quick Decision Summary

| Decision                      | Choice                                                                  | Reason                                                    |
| ----------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------- |
| Build Tool                    | **Vite 6+**                                                             | Fastest DX, first-party Tailwind plugin, near-instant HMR |
| UI Framework                  | **React 19**                                                            | v0.dev components, shadcn/ui, massive ecosystem           |
| Router                        | **React Router 7**                                                      | Stable, Vite-native, declarative routing                  |
| UI Library                    | **shadcn/ui + Tailwind CSS 4**                                          | Medical-grade clean UI, accessible, CSS-first config      |
| Backend / Auth                | **Firebase (Auth + Firestore)**                                         | Free tier, real-time, Google login                        |
| File Storage (photos/reports) | **Firebase Storage** (primary) + **Google Drive API** (optional export) | Integrated auth, 5GB free, auto-scales                    |
| Database                      | **Cloud Firestore**                                                     | NoSQL fits patient timeline data well                     |
| Hosting                       | **Vercel** (static deploy)                                              | Free tier, instant deploys, simpler than SSR              |
| PWA                           | **vite-plugin-pwa**                                                     | Gold standard PWA — offline caching, install prompt       |
| Prototyping                   | **v0.dev**                                                              | AI-generated React + Tailwind UI, reusable code           |
