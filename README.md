# Tender Document Package Builder

A browser-based Tender Document Package Builder that helps users upload, validate, match, and generate a final tender document package directly in the browser.

## Student Information

- **Name:** MD TAHSIN ALAM TANIM
- **Registration Number:** 242-15-074
- **Live Demo:** https://devfest-242-15-074.vercel.app/

## Project Overview

Tender Document Package Builder is designed to simplify the preparation of tender document packages.

The application dynamically loads tender requirements from `requirements.json`, allows users to upload PDF documents, validates document requirements, matches uploaded documents to requirements, checks expiry dates, detects duplicate PDFs, and generates a final combined PDF package.

The application runs entirely in the browser.

## Features

### Requirements

- Dynamically loads `requirements.json`
- Reads tender information from the requirements file
- Displays tender ID, title, procuring entity, bidder, and submission deadline
- Supports mandatory and optional requirements
- Preserves requirement ordering

### PDF Upload

- Upload multiple PDF documents
- Maximum 30 PDF files
- Maximum total upload size of 50 MB
- Rejects non-PDF files
- Displays filename
- Displays PDF page count
- Allows individual files to be removed
- Detects damaged or password-protected PDFs

### Document Matching

- Match uploaded PDFs to requirements
- One PDF can only satisfy one requirement
- One requirement can only have one PDF
- Change an existing document match
- Remove document matches

### Expiry Validation

- Supports requirements with expiry dates
- Detects missing expiry dates
- Detects expired documents
- Compares expiry dates against the tender submission deadline
- Updates requirement status immediately

### Duplicate Detection

- Uses SHA-256 hashing for exact duplicate detection
- Detects identical PDF files even when filenames are different
- Prevents duplicate documents from being used for different requirements

### Status System

Requirements can have the following statuses:

- Missing
- Expiry date needed
- Expired
- Not provided
- OK

Blocking statuses:

- Missing
- Expiry date needed
- Expired

Optional documents marked as `Not provided` do not block package generation.

### PDF Package Generation

The final package contains:

1. English cover page
2. Tender information
3. Included documents in requirement order
4. Matched PDF documents
5. Original document page order preserved
6. Footer on every page
7. Total page count
8. Automatic download using the tender ID

Generated filename:

`<tender_id>_Package.pdf`

## Bilingual Interface

The application supports:

- English
- Bangla

Users can switch between languages from the application interface.

## Technology Stack

- React
- Vite
- JavaScript
- CSS
- pdf-lib
- pdfjs-dist
- Browser Web APIs
- SHA-256 Web Crypto API
- Vercel

## Project Structure

```text
tender-package-builder/
│
├── sample-pack/
│   ├── requirements.json
│   └── documents/
│
├── output/
│   └── .gitkeep
│
├── screenshots/
│   └── status.png
│
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── TenderInfo.jsx
│   │   ├── RequirementsList.jsx
│   │   ├── FileUploader.jsx
│   │   ├── StatusBadge.jsx
│   │   └── MatchPanel.jsx
│   │
│   ├── utils/
│   │   ├── pdfUtils.js
│   │   ├── validation.js
│   │   └── translations.js
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── package.json
└── README.md
