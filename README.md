# ML Internship Portfolio — Yumna Kashif

- **Author:** Yumna Kashif
- **Internship:** Machine Learning Engineering Internship — FlyRank AI
- **ML Lane:** Structured Content Archetype Clustering
- **Project Type:** Interactive ML Portfolio
- **Built With:** HTML, CSS, JavaScript, Formspree, Netlify
- **Status:** Deployed

> An interactive, evidence-first portfolio documenting my first Machine Learning Engineering internship through real notebooks, honest validation, and a structured content clustering capstone.

## 🔗 Project Links

| Resource                          | Link                                                                                                        |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Live Portfolio**                | [yumnakashif-ml-internship-portfolio.netlify.app](https://yumnakashif-ml-internship-portfolio.netlify.app/) |
| **FlyRank Internship Repository** | [github.com/yumna-09/FlyRank-ML-Internship](https://github.com/yumna-09/FlyRank-ML-Internship)              |
| **Deployed Research Paper**       | [Structured Content Archetype Clustering](https://yumna-09.github.io/FlyRank-ML-Internship/)                           |
| **LinkedIn Profile**              |  [LinkedIn](https://www.linkedin.com/in/yumna-kashif-3a69ba357/)                                                                                         |

---

## Overview

This portfolio documents the work completed during my first Machine Learning Engineering internship at FlyRank AI.

Rather than presenting the internship as a collection of claims, the portfolio connects each major result to real notebook evidence, model outputs, validation decisions, and limitations.

The central project explores how content pages can be grouped into natural performance archetypes using observed search and engagement signals—without inventing a clean label for “which page needs help.”

The resulting model supports a human-reviewed action queue with four possible recommendations:

* **REFRESH**
* **BOOST**
* **PRUNE**
* **MONITOR**

The system is presented as **decision-support**, not automatic content action.

---

## Portfolio Pages

| Page           | Purpose                                                               |
| -------------- | --------------------------------------------------------------------- |
| `index.html`   | Interactive homepage and project overview                             |
| `work.html`    | Internship case study, notebook evidence, model results, and capstone |
| `about.html`   | Skills, background, professional timeline, and profile links          |
| `contact.html` | Interview-call scheduling form and contact options                    |

---

## Featured ML Work

### Structured Content Archetype Clustering

The capstone groups content pages according to observed performance behavior using KMeans clustering.

### Working Sample

* **30,000** anonymized content pages
* **32** clients
* **44** available columns
* **5** selected modeling features
* **7** behavioral archetypes

### Modeling Features

* Impressions over 90 days
* Click-through rate
* Average search position
* Engagement rate
* Content age in days

### Honest Validation

The model was evaluated using a grouped client-held-out split so that pages from held-out clients were not included during model fitting.

| Evaluation                 | Silhouette Score |
| -------------------------- | ---------------: |
| Rule-based baseline        |         `0.0013` |
| All-data KMeans result     |         `0.3763` |
| Held-out-client validation |         `0.3046` |

The lower held-out score is treated as the more truthful estimate because it measures how the clusters behave on unseen clients.

**Validation configuration:**

* KMeans clusters: `k = 7`
* Random seed: `42`
* Training clients: `25`
* Held-out clients: `7`

---

## What the Portfolio Demonstrates

* Unsupervised machine learning
* KMeans clustering
* Feature selection and scaling
* Silhouette analysis
* Grouped client-held-out validation
* Leakage auditing
* Baseline comparison
* Human-review workflow design
* Research communication
* Evidence-based model reporting
* Responsive frontend development
* Light and dark theme implementation
* Accessible motion and interaction states

---

## Design and Interaction System

The portfolio uses a consistent navy, teal, pearl, and warm-neutral visual system across light and dark themes.

Key interface features include:

* Glass-inspired responsive surfaces
* Cursor-following 3D card depth
* Animated notebook evidence showcase
* Interactive clustering pipeline
* Horizontal professional timeline
* Optional instant timeline view
* Theme-aware contact globe
* Staggered CTA shine effects
* Reduced-motion support
* Mobile-specific layouts
* Persistent light and dark theme preference

The animation supports the project narrative without replacing the underlying content.

---

## Technology Stack

| Category        | Technology         |
| --------------- | ------------------ |
| Structure       | HTML5              |
| Styling         | CSS3               |
| Interaction     | Vanilla JavaScript |
| Typography      | Google Fonts       |
| Form Backend    | Formspree          |
| Deployment      | Netlify            |
| Version Control | GitHub             |

No frontend framework or component library is required to run the portfolio.

---

## Project Structure

```text
ML-Internship-Portfolio/
├── index.html
├── work.html
├── about.html
├── contact.html
├── style.css
├── script.js
├── cv.pdf
└── images/
    ├── notebook evidence
    ├── capstone figures
    ├── proof screenshots
    ├── portfolio graphics
    └── branding assets
```

---

## Run Locally

1. Download or clone this repository.
2. Open the project folder.
3. Open `index.html` in a modern browser.

Alternatively, use a local development server:

```bash
python -m http.server 8000
```

Then visit:

```text
http://localhost:8000
```

---

## Evidence and Scope

This portfolio uses anonymized and public-safe internship evidence.

It does not include raw production data, client names, private credentials, or confidential identifiers.

The clustering results describe patterns within the evaluated data. They do not prove causal relationships, guarantee content outcomes, or replace human review.

The complete methodology, limitations, and reproducibility details are available in the [deployed research paper](https://yumna-09.github.io/FlyRank-ML-Internship/).

---

## AI-Assisted Development Transparency

This portfolio was developed through an AI-assisted coding workflow.

The project direction, requirements, content, evidence selection, design decisions, validation standards, testing, and final quality review were owned by **Yumna Kashif**.

AI was used as an implementation and iteration partner for coding, debugging, responsive refinement, and interface experimentation. Every shipped section was reviewed against the internship work it represents.

---

## Acknowledgements

This portfolio was created as part of my Machine Learning Engineering or AI Fluency internship at [FlyRank AI](https://flyrank.ai/).

Thank you to **Alen Malkoč**, **Mirza Ašćerić**, **Haris Hodzic**, **Léo Yigit Ekiz**, and **Eldin Pintol** for their guidance and support throughout the internship.

---
