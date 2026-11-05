# Superclass: technical evidence brief for the website

**Evidence snapshot: November 3, 2026, 8:06 p.m. America/New_York.** This is a source/code/artifact audit, not a new model evaluation or a legal clearance. No website, model, dataset, training process, or frontend was changed. Completed results below are from saved reports, checked against saved audit outputs; this audit did not rerun training or paid inference. Work in another thread was still producing v3 artifacts. Results generated after this snapshot require a separate update.

Three repositories were examined:

- **Product:** `/Users/Aayush/MetaHackathon` — Superclass landing page, retained educator backend, archived workspace UI.
- **Competition model:** `/Volumes/EEG Research Workspace/MetaHackathon` — actual content inference, EEG fitting, TRIBE outputs, qualification and benchmark artifacts. Its internal names still use `perception`; that is a naming issue, not a second independently validated product.
- **Standalone research:** `/Users/Aayush/Workspace/Nueroscience Research` — earlier audiovisual/speech EEG studies, explicitly without product affiliation. Its results must not be attributed to the competition model. [A1] [A8] [R1]

Both product and competition checkouts reported HEAD `f2c38a14bb444e23a2bfb052583786e6c3ff500a`, but substantial working-tree changes exist. That commit alone does **not** identify the audited implementation. Stable result hashes and line-specific sources are recorded below.

## 1. One-page explanation: how Superclass works today

**Superclass currently consists of an educator-workflow prototype and a separate experimental brain-response pipeline. They are not yet one operational classroom-prediction system.** The active Next.js website is a landing page. The previous interactive workspace is archived. The retained FastAPI backend can accept a short video, an educator-supplied transcript and assessment questions, preserve lesson versions, and generate simple learner action traces. Its research adapter checks storage readiness and cache identity; it does not call the fitted brain model. [A1] [A2] [A3] [A8]

In that backend, a “student” is an authored profile with low, medium or high prior knowledge and a list of misconception terms. A deterministic program reads sections, asks a stock question for low-prior-knowledge profiles, revisits matching terms, and randomly chooses quiz options. It does not learn from the lesson, use an LLM, update a knowledge state, or interact with other students. The resulting content checks are hypotheses for educator review. Attention and quiz metrics are deliberately unavailable. [A4] [A5] [A6]

The separate model pipeline has done real inference and training. It extracts text, audio and visual representations using Meta models, runs the pretrained TRIBE cortical-response predictor, and fits a small EEG model using recordings associated with four EduGage lectures. The EEG training subset contains 16 participants, 31 supported viewings and 1,020 overlapping participant-window rows, representing only 145 distinct content windows. This is a small exploratory dataset, not a large collection of independent lessons. [M1] [M2] [M3]

The completed v2 model predicts **four channel means and four log-transformed variances**, using 44 seconds of content context at five-second query intervals. These are coarse summaries of recorded EEG values, not EEG waveforms, thoughts, attention scores or understanding scores. Physical EEG sample synchronization and signal-quality calibration remain unqualified. Text and PDF timing is assumed from reading/display schedules, not measured from a student's reading. [M1] [M4] [M5]

TRIBE provides a separate **predicted average-subject cortical response**. No fMRI was measured from these learners, and no local EEG training updates TRIBE's fMRI branch. The system therefore does not demonstrate that EEG improves fMRI prediction. [M1] [M6] [M7]

Engineering checks succeeded, including saved-model replay and five input formats. Predictive performance did not meet the completed v2 experiment's success criterion: full fusion had normalized EEG MAE **2.1097**, versus **0.8524** for the TRIBE-derived EEG comparator and **0.8543** for the training-mean baseline. Lower is better. A repair experiment, v3, was underway at this snapshot; it is not a completed result. The defensible story is an implemented research prototype with transparent negative findings and a defined validation roadmap. [E1] [E2] [E3] [E4] [V3]

## 2. Claim-by-claim publication decision

“Demonstrated” means supported by the inspected implementation and execution evidence in the stated scope. It does not mean independently replicated scientific validity. “Planned” means an explicit design exists without the required result. “Unverifiable” means critical evidence is absent; “unsupported” means the proposed wording exceeds or conflicts with available evidence.

| Proposed claim | Verdict | What the evidence actually supports | Evidence required before the original wording is defensible |
|---|---|---|---|
| **“The first neural world model of human learning”** | **Unsupported**; priority is also unverifiable | A content-to-EEG-summary predictor, a frozen fMRI predictor and a separate scripted simulator. There is no learned learner-state transition model or validated learning endpoint. Relevant prior work already covers neural student modeling, student simulation, classroom agents and audiovisual neural encoding. [A4] [M1]; external sources N1–N6 below. | Define “neural,” “world model” and “learning” operationally; implement and evaluate state changes under instructional actions, with human learning outcomes; publish a dated, reproducible contribution and systematic novelty comparison. Even that cannot prove the absence of unpublished competitors. Remove “first” now. |
| **Uses large-scale EEG and fMRI datasets** | **Partially supported** | Local EEG fitting uses four lectures/16 people; TRIBE supplies externally pretrained fMRI-derived representations. This project has not shown large-scale joint EEG/fMRI training. Paper-wide TRIBE corpus size must not be described as Superclass's collected or locally trained dataset. [M1] [M6] [M8] | A versioned inventory of data actually used by each training stage, participants/hours/independent stimuli after exclusions, permissions, preprocessing and fit manifests. Resolve the released TRIBE checkpoint's lineage before assigning the paper-wide cohort count to this exact checkpoint. |
| **Trains AI models directly on brain signals** | **Partially supported** | Small local models are supervised against means/log-variances computed from real EEG recordings. Content is the predictor input; EEG summaries are training targets. No raw-waveform foundation-model training or joint EEG/fMRI optimization is implemented. [M4] [M9] | For the broad claim, specify the signal representation and training objective, publish target/QC provenance and held-out evaluation. For joint brain training, provide actual fMRI supervision and training code. Safe wording: “We train experimental models to predict EEG-derived summary features from lesson content.” |
| **Simulates entire classrooms with agents** | **Partially supported** | Up to 100 scripted trajectories from at most 12 authored profiles; 36 default trajectories. These are not 100 independently learned students, interacting agents or calibrated demographic models. [A4] [A5] [A6] | A real agent policy, explicit knowledge/memory state, exposure and answer-key restrictions, state updates, classroom orchestration/interactions, and validation against held-out human trajectories and learning changes. Report whether 100 means concurrent agents or repeated runs. |
| **Predicts brain responses to each sentence of a PDF and each second of a video** | **Partially supported**, misleading as stated | Research code processes both formats. Native TRIBE outputs use their own approximately one-second bins; EEG summaries use five-second queries over 44 seconds. PDF words are scheduled uniformly within assumed page dwell times; no sentence-specific neural validation exists. [M5] [M6] [M10] | Verified sentence-to-presentation mappings and reading clocks, actual EEG/fMRI ground truth for each modality, held-out segment-level scoring, boundary/missingness tests and uncertainty. A plotted one-second sampling grid alone does not establish one-second physiological accuracy. |
| **Predicts attention, confusion and understanding** | **Unsupported**; attention/quiz modeling is **planned** | Backend returns unavailable predictions. The frozen behavioral protocol proposes attention-difficulty self-report and quiz correctness, not a confusion detector. EEG means/variance and TRIBE predictions are not those labels. [A4] [A7] [M1] | Audited endpoint definitions; valid ratings/quiz keys/pre-post pairings; separate supervised heads fitted wholly inside training folds; content-only and brain-feature ablations; calibrated held-out error and uncertainty across people/lessons; prospective replication. Confusion needs its own labels and protocol. |
| **Helps teachers evaluate lessons before teaching** | **Partially supported** | Retained backend can organize materials, flag transcript/assessment mismatches and propose checkpoints. The active website does not expose that complete workflow, and educational benefit has not been tested. [A1] [A2] [A4] | Restore/connect the teacher interface; test upload-to-report with representative educators; show usable, source-linked suggestions and limitations. To claim better learning, conduct a prospective study of teacher decisions and student outcomes. |
| **Uses Meta models in a meaningful part of the system** | **Demonstrated for the separate research pipeline**; not connected to the current classroom backend | Actual TRIBE/Llama/W2v-BERT/V-JEPA2 inference, Meta semantic/transcription/SAM calls and SAM Audio outputs are recorded. Video auxiliary descriptors enter the EEG head. Nonvideo supplemental descriptors are generated but not consumed by the v2 EEG head. [M11] [M12] [M13] [M14] [M15] | No further evidence needed for this scoped statement. For “powers the teacher app,” require an audited backend integration and end-to-end product execution with versioned model provenance. |

### Existing work relevant to “first”

This is a targeted prior-art check, not a patent search or exhaustive systematic review. These works need not match every proposed feature to make the broad priority claim indefensible:

- **N1 — Deep Knowledge Tracing (2015):** recurrent neural networks model students' knowledge from coursework interactions. This predates broad claims of neural models of learning; it does not use EEG. [Paper](https://arxiv.org/abs/1506.05908).
- **N2 — SimStudent:** machine-learning agents learn cognitive skills and support student-model discovery; the project's bibliography includes work well before Superclass. [Project publications](https://www.simstudent.org/publications).
- **N3 — SimClass (2024 preprint; NAACL 2025):** LLM-based multi-agent classroom simulation with teacher/student interactions. This overlaps the classroom-agent proposition, not necessarily brain-signal modeling. [Published paper](https://aclanthology.org/2025.naacl-long.520/).
- **N4 — TRIBE v2 (2026):** pretrained multimodal brain-response encoding and in-silico neuroscience. Its paper reports over 1,000 hours of fMRI across 720 subjects; those are upstream paper figures, not Superclass training counts. [Paper](https://arxiv.org/abs/2605.04326).
- **N5 — Desai et al. (2024):** audiovisual versus unimodal EEG encoding models. Content-to-EEG prediction itself is established prior work. [PLOS Computational Biology](https://journals.plos.org/ploscompbiol/article?id=10.1371/journal.pcbi.1012433).
- **N6 — EEG Moments Dataset (2026):** video EEG encoding with eye tracking; the same stimulus collection also has a BOLD dataset. This is close prior art for combining temporal and spatial neural responses, though it is not an educational-outcome system. [Paper](https://arxiv.org/abs/2608.28768).
- **N7 — StudentSim (2026):** learner-specific simulators trained to reproduce responses and adapt under tutor guidance, with an explicit behavioral evaluation framework. [Paper](https://arxiv.org/abs/2609.01591), [author project](https://microsoft.github.io/StudentSim/?lang=en).

The standalone repository already reaches the same narrower novelty conclusion for audiovisual EEG encoding. Its proposed adolescent transfer study is a research ambition, not collected Superclass evidence. [R2]

## 3. Inputs, clocks and actual outputs

| Data/input | Current handling | What it is not | Source |
|---|---|---|---|
| Teacher video | Product API: `.mp4`, `.m4v`, `.mov`, `.webm`; positive duration up to 600 seconds; maximum 250 MiB. | Not arbitrary-length curriculum ingestion; these limits differ from the research CLI. | [A2] |
| Transcript | Product accepts wholly timed `MM:SS - MM:SS \| passage` lines or wholly untimed text. Rejects reversed/overlapping timed spans. Missing transcript pauses deterministic analysis. | Not automatic product ASR or inferred reading time. | [A4] |
| Assessments | Prompt, 2–6 options, answer index; edits create versions. Public lesson serialization omits keys, but a separate assessment API returns them. | Not human quiz-outcome labels. “No keys in rendered runs” is not application-wide authentication or access control. | [A2] [A5] [A9] |
| Learner profiles | Name/ID, prior knowledge `low/medium/high`, misconception strings, provenance. | No learned demographic embedding, age calibration, cognitive ability estimate or evolving mastery. | [A5] |
| Research video/audio | Hash-validated local files plus explicit origin/cloud-processing basis. Video `.mp4/.mov/.mkv/.webm`; audio `.wav/.mp3/.flac/.ogg`. | A source URL or hash alone does not establish copyright permission or historical stimulus identity. | [M16] |
| Research text | UTF-8 `.txt`, explicit words per minute; source words retained on an assumed schedule. | Not measured reading, gaze, sentence difficulty or synthetic speech presented as observation. | [M5] [M10] |
| Research image/PDF | `.png/.jpg/.jpeg/.webp` or `.pdf`; page rendering plus explicit seconds per page; PDF text extraction. No image OCR in the qualified path. | A teacher PDF cannot silently acquire a real student clock. Extracted PDF word order is not independently validated reading order. | [M5] [M10] [M2] |
| EEG training records | EduGage received-sample CSV values, montage TP9/AF7/AF8/TP10, receiver timestamps and playback logs. The source repository reports nominal EEG 256 Hz; local timing uses received groups, not a reconstructed hardware clock. | Not EEG uploaded by a teacher at inference; not the browser's `channel,value` preview CSV. | [M4]; [EduGage source](https://github.com/ZikangLeng/EduGage) |
| fMRI | Frozen model output arrays, 20,484 fsaverage5 cortical vertices. No measured learner fMRI target enters the current local fit. | Not new scans, individualized anatomy, whole-brain/subcortical coverage or proof of activated named regions in these students. | [M6] [M7] [M17] |
| Gaze/other physiology | Present in the source dataset, not inputs or targets in the completed fusion model. | Do not draw a measured-gaze arrow into the EEG model. | [M1] [M3]; [dataset record](https://figshare.com/articles/dataset/EduGage_Dataset/32145994) |
| Model output bundle | Checksummed NPZ and JSON: EEG query seconds, eight features, support flags, native cortical arrays and segments, source/model identity, evaluation status. Unsupported JSON values are `null`. | No attention, retention, quiz, confusion or persona scores. Support means available coverage, not confidence. | [M18] [M19] |

The archived Lab can preview local EEG CSV and NIfTI slices. Its EEG magnitudes are relative to the imported file, and the MRI slice is not registered to its illustrative brain. This is a visualization utility, not a training/inference connection. [A10]

## 4. Training architecture and versions

### Local EEG supervision

The four included lectures are **Ideal Rocket Equation**, **Atmospheric Pressure/Composition**, **X-ray Diffraction**, and **Healing Radiation**. The corpus registry pins current owner-hosted media paths, source SHA-256 values and each content-feature artifact. The supported EEG cohort is 16 people across 31 viewings; participant 2's X-ray viewing has no supported targets. “Completed viewings: 32” in the extraction summary means 32 cases were processed, not 32 usable EEG records. [M3] [M20]

Alignment associates EEG samples received within accepted playback-poll intervals with the interval's **left reported video position**. For query `q`, target construction selects groups in `[q−44, q)` only when one continuous playback chain supports the context. It pools counts, means and centered sums of squares, then emits four means and `log1p(population variance)` for four channels. It retains burst arrivals and does not interpolate missing periods. Exact arithmetic replay verifies this observation rule; it does not establish hardware-level synchronization or clean neural content. [M4]

The dataset authors also describe receiver-arrival Muse timestamps, relay latency and the absence of a separate Muse hardware clock. Thus a timing limitation is supported by both local code and the source methods, rather than inferred solely from a failed model. [EduGage methods, Appendix B](https://arxiv.org/html/2605.01238v1#A2)

### Completed v1

Frozen native content representations, TRIBE-predicted cortex and auxiliary descriptors feed training-only per-block scaling/PCA (maximum 16 components), then an equal-viewing weighted eight-output ridge readout with λ=1. Additional available-modality transfer heads support nonvideo inputs. v1 produced invalid negative log-variance predictions in 191 all-block held-out values, retained in its report. Its weak generalization must remain in the experiment history. [M2]

### Completed v2

1. Capture native **pre-brain-projection** encoder tensors for text/audio/video; capture changes no model inputs. Separately retain TRIBE's predicted cortical output. The EEG “TRIBE representation” is the **predicted cortex**, not an undocumented hidden-state embedding. [M21] [M22]
2. Construct coverage-weighted **2 Hz** input grids. A one-second cortical interval can support two input bins; this creates no new measured fMRI temporal information. Missing coverage is rejected, not interpolated. [M22]
3. Fit scalers and PCA, at most 16 components per block, **only on unique training content** in each outer fold. A sample has 88 time steps × four blocks × 16 coordinates, plus four modality masks. [M9] [M23]
4. Project the masked input to width 32 with a 1×1 convolution. Apply three residual Conv1D layers, kernel 3, dilations 1/2/4, LayerNorm and GELU; mean-pool time. This is a small temporal convolutional model, not a newly trained billion-parameter TRIBE transformer. [M9]
5. Concatenate six window-level auxiliary blocks (audio descriptors, progress, SAM Audio, SAM visual, semantics, visual descriptors), each padded to 16 PCA coordinates, plus availability masks. The head is Linear→GELU→Linear with eight outputs. Log-variance targets use a positive softplus parameterization. [M9] [M22]
6. Train 16,296 parameters per network with AdamW, learning rate .001, weight decay .01, batch 32, 100 epochs, gradient clipping 1 and standardized Huber loss. Weights balance lectures, then observed viewers, then windows. Modality dropout .2 retains at least one available modality; dropping one also masks auxiliary inputs. Seeds 17/29/43 are averaged, never selected by outer score. [M1] [M9] [M23]
7. Fit a separate full-data deployment ensemble after evaluation. Its in-sample outputs are not validation. The deployment manifest explicitly records failure of the benchmark target and no participant-specific prediction. [M24]

No participant ID or learner profile is fed to that EEG network. Repeated viewers supply different training targets for shared content; at inference the same content yields the same ensemble prediction. A hundred profiles do not produce a hundred empirically grounded neural responses. [M1] [M9] [M24]

### v3 at this snapshot: implementation, not a completed benchmark

The frozen revision specifies training-only quantile bounds, near-constant feature removal, bounded standardized/PCA values, reduced auxiliary gain and a regularized multimodal correction around a frozen v2 TRIBE-only **EEG** anchor. The correction is bounded to 0.1 training-target SD per output. This is not an update to the native TRIBE fMRI head, and the bound does not guarantee lower error. It retains the same 1,020 rows and uses v2-informed choices, so any eventual result remains exploratory. [V3]

`fusion_v3_model.py`, `fusion_v3_experiment.py`, quality/audit/report code and partial fold artifacts exist. At 8:06 p.m., the completed evaluation manifest, benchmark report and audit report were absent; `started.json` marked `complete: false`. Do not publish a v3 score, claim a passed gate, or quietly replace v2's result. [V4]

### Frozen fMRI branch and an important provenance distinction

The pipeline loads `facebook/tribev2` and its frozen encoders. It preserves native predicted cortical values and timestamps; EEG losses do not backpropagate into this branch. Output is an average-subject prediction, not measured student fMRI. [M6] [M7] [M11]

The exact cached checkpoint configuration, hash `a17212a257dfd91424e20a5fa8640d107fbbf79e842b6b2d72d17d24399dc9ef`, has an eight-layer noncausal Transformer, eight heads, hidden size 1152, subject layers configured for 25 subjects, low-rank head 2048, MSE loss and 100-TR contexts. Its neural output configuration is 1 Hz with a five-second neuro offset; input features are 2 Hz. These are **upstream checkpoint settings**, not training Superclass performed. [M8]

The TRIBE paper's 720-subject/1,000+-hour corpus and this release configuration's 25-subject setting are different pieces of evidence. This audit does not resolve their exact training lineage. Do not assert that this particular checkpoint was locally trained on 720 people, or that the local EEG model inherits the paper's published accuracy. Ask the TRIBE maintainers for the checkpoint-to-paper mapping. [M8]; [TRIBE paper](https://arxiv.org/abs/2605.04326)

## 5. Inference: what actually happens to content

| Stage | Input → transformation → output | Execution/evidence boundary |
|---|---|---|
| Source admission | File + hash + origin/cloud-use basis → validation → authenticated request | Research CLI/Python entrypoint; separate from product upload. [M16] |
| Presentation | Timed media → decoded clock/audio/frames; text → assumed word schedule; PDF/image → page images and timed presentation | Offline processing. Explicit clock assumptions, no observed gaze. [M5] [M10] |
| Native words | Audio/video → upstream word extraction **before** chunking → contextualized word events | Local adapter changes the pinned demo's event ordering to avoid duplicated/shifted words. It is not a byte-for-byte reproduction of upstream preprocessing. [M25] |
| Frozen content encoding | Word events/audio/video clips → Llama/W2v-BERT/V-JEPA2 → native temporal tensors | GPU inference on Modal; tensors captured before brain-trained projection. [M11] [M21] |
| Native cortex | Frozen tensors → pretrained TRIBE → cortical prediction and native segments | Same events/weights run with and without capture hook; equivalence checked. This verifies capture, not scientific accuracy or independent replication. [M11] |
| Video auxiliary descriptors | Sampled frames → SAM masks; audio → SAM Audio separation; 30-second audio chunks → Meta transcript → grounded semantic counts; media → sensory descriptors | SAM concepts: person/diagram/text. Semantic classes: definition/worked example/equation/question/topic term, plus word-rate/length. Descriptors are not attention labels. [M12] [M13] [M14] |
| EEG prediction | Native tensors + predicted cortex → per-fold/full-fit transforms → 88-bin contexts; video auxiliaries added after pooling → ensemble eight-feature forecasts | Local CPU/PyTorch. Missing intervals retain support masks. [M9] [M19] |
| Nonvideo distinction | Available native content + cortex → same v2 network with missing-modality masks | Supplemental Meta/SAM features may be computed but are **not fed** to nonvideo v2 EEG prediction; auxiliary masks remain zero. Label these outputs experimental transfer. [M5] [M19] |
| Export | EEG predictions + unchanged cortical arrays → versioned JSON/NPZ and optional cortical-surface bundle | Does not feed classroom agents in the inspected product. No behavioral scores. [M18] [M17] [A3] |

For a graphic, an EEG point at 60 seconds summarizes the supported preceding 44-second context; it is not a measured spike at second 60. TRIBE's one-second output bins retain the native clock and separate five-second neuro-offset metadata. Do not silently shift/relabel the two clocks, interpolate unsupported EEG points, or animate them as a single synchronized measured brain. [M4] [M6] [M18]

Native output length is not automatically playable lesson length: the qualified video fixture lasts 60.359375 seconds while its cortical output has 65 rows. A frontend must consult source duration and native segment metadata, retain the original arrays, and explicitly identify boundary/context bins rather than suggesting the source contains extra lesson seconds. [E3] [M33]

The surface export uses fsaverage5 ordering and retains native values. It has no anatomical region labels and explicitly does not claim independently validated checkpoint anatomical correspondence. Do not label hot spots “confusion center,” “memory formation,” or student-specific anatomy. [M17]

## 6. Classroom simulation and educator workflow

### Implemented simulator

| Element | Actual implementation |
|---|---|
| Agent architecture | A seeded Python function, `simulate_one`; no model call, policy learning, neural response input or autonomous tool loop. [A4] |
| Prior knowledge | Static enum `low/medium/high`; misconception strings matched against section text. [A5] |
| State | Current section iteration and accumulated action list; profile stays fixed. No mastery vector, forgetting, fatigue, attention or learning update. [A4] |
| Actions | Read every exposed section; low knowledge adds the same request for an example; term matches cause review; quiz options selected with seeded random choice. [A4] |
| Constraints | Per-run action cap; maximum 12 profiles and 100 total trajectories. Token/cost fields exist but these runs make no model calls. The simulator does not use answer keys, although the LessonVersion object holds assessments. [A4] [A5] [A6] |
| Orchestration | SQLite-backed jobs, a sequential worker loop, deterministic run IDs, persisted progress, restart/resume and cancellation; SSE updates. No agent-agent or agent-teacher conversation. [A6] [A2] |
| Findings | Transcript cue/keyword checks, generated separately from trajectories: absent practice cues and weak assessment terminology overlap. [A4] |
| Output | Source-linked action traces, authored repair proposals, versioned records, unavailable behavioral prediction bundle; no validated learning distributions. [A4] [A5] |

“Agent-generated hypothesis” is the current schema label; **“scripted content-review hypothesis”** is the clearer website wording. The label must not imply an LLM or neuroscience generated the action. [A4]

### What a teacher can do

**On the current landing page:** read the project description and interact with conceptual/synthetic research panels. The visible Get Started link points to the About section; the current page does not contain the retained workspace's upload-to-run interface. [A11]

**Through the retained backend, or a restored archived workspace:** upload a video/transcript/assessment, review extracted concepts, edit questions/profiles, create bounded scripted runs, inspect timestamped hypotheses, create a proposed checkpoint revision, compare versions and export an HTML report. The code does not claim that the revision improves learning, and a text checkpoint does not re-edit the source video. [A2] [A4] [A9]

These paths have workflow tests for uploads, 36 runs, action caps, missing prediction scores, revision preservation and a 100-trajectory request limit. Tests are software behavior evidence, not teacher usability or student-outcome validation. The inspected test accepts a 100-trajectory request; it does not demonstrate 100 sophisticated agents running concurrently. [A9]

## 7. Meta components: exact identity and implemented role

| Component | Identifier / endpoint | Role and evidence of execution |
|---|---|---|
| TRIBE v2 | `facebook/tribev2`, checkpoint revision `f894e783020944dcd96e5568550afe2aa9743f9f`; upstream code `af58661791a351a448a489042a28f6c37e1c14b7` | Predicted average-subject cortex; also an EEG input block. Actual rocket qualification: 721 × 20,484 output, capture replay difference 0. [M11] [M15] [M26] |
| Llama 3.2 | `meta-llama/Llama-3.2-3B`, revision `13afe5124825b4f3751f836b40dafda64c1ed062` | Frozen language representation inside native TRIBE; captured for the EEG input. Not the student-agent policy. [M11] [M15] |
| Wav2Vec-BERT | `facebook/w2v-bert-2.0`, revision `da985ba0987f70aaeb84a80f2851cfac8c697a7b` | Frozen audio representation inside TRIBE and EEG inputs. [M11] [M15] |
| V-JEPA2 | `facebook/vjepa2-vitg-fpc64-256`, revision `875c192b7b704b87d1e1d99345769632dd5f739a` | Frozen visual representation inside TRIBE and EEG inputs. [M11] [M15] |
| SAM visual | `sam-3.1`, Meta Responses API, base URL `https://api.meta.ai/v1` | Frame segmentation; mask counts/areas become video-window descriptors. Not a model of attention or learning. [M12] [M13] |
| SAM Audio | `facebook/sam-audio-small`, revision `20b65f56888142eebe7c37448c6f6b3b32600e9b`; code `bb4c6999d2677c7402360e426afc01ddfad6dce0` | Text-prompted speech separation and target/residual descriptors, running in a separate Modal image. Smoke check verifies actual arrays, not separation accuracy. [M11] [M15] [M27] |
| Muse Spark | `muse-spark-1.3`, Chat Completions at `https://api.meta.ai/v1` | Structured transcript facts with source quote validation; counts/rate descriptors enter video EEG head. Not a fitted pedagogical or learner model. [M12] [M13] |
| Muse Voice | `muse-voice-transcribe-1.0`, `https://api.meta.ai/v1/asr/transcribe` | Chunk-level transcript for auxiliary semantics. PUSH_TO_TALK output does not supply the native TRIBE word-alignment clock. [M14] |

Upstream descriptions corroborate model roles: [TRIBE model card](https://huggingface.co/facebook/tribev2), [SAM Audio card](https://huggingface.co/facebook/sam-audio-small), [Meta API models](https://dev.meta.ai/docs/models). These sources are not evidence that a Superclass run executed; the local qualified output manifests provide that evidence. [M15] [M26] [M27]

The deployment is hybrid: Modal functions request A100-80GB GPUs with 64 GiB host memory for the heavy components; hosted Meta APIs supply semantic/transcription/segmentation outputs; local CPU code runs the EEG readout. This is not all running inside the browser. The declaration is a configured worker resource, not a measured minimum hardware requirement or latency promise. [M28] [M19]

## 8. Evaluation and publishable numbers

**Publication rule:** the following numbers can appear in a transparent research-results section with the indicated qualifications. They are not product accuracy, attention accuracy, percentage of students understood, or evidence of beating TRIBE on fMRI. Blank cells mean unavailable; never replace them with zero.

### Design and gate

The completed v2 comparison uses eight crossed topic-family × participant-group folds. Each train/test pair separates both participants and lessons; training uses the other topic family and excludes the held participant group. All arms share supported rows and training target scales. Input scalers/PCA and target transforms are fitted in training scope; forecasts are saved before held-out scoring. The primary metric averages absolute error normalized by training-target SD, equally across targets, windows within viewing, observed people within lecture, and lectures. [M23] [M34] [E2] [E5]

Success required at least 5% lower primary error than the matched TRIBE-only temporal EEG comparator, plus beating the training mean. The comparator has the same network family and training budget but non-TRIBE inputs masked; effective information is not identical. Two thousand paired participant/lecture cluster resamples give descriptive uncertainty conditional on fixed fits. Only four already-inspected lessons underpin these intervals; this is not untouched population-level validation. [M23] [E1]

### Completed v2: all prespecified arms

| Arm | Normalized MAE ↓ | Normalized RMSE ↓ | Negative predicted log-variances | Publication status/source |
|---|---:|---:|---:|---|
| Training-target mean | 0.8542634971 | 1.2055884879 | 0 | Baseline, [E1] [E2] |
| TRIBE-derived ridge | 0.8816404328 | 1.2418624274 | 0 | EEG transfer baseline, [E1] [E2] |
| TRIBE-only temporal EEG network | 0.8523543209 | 1.2491828564 | 0 | Primary comparator, [E1] [E2] |
| Full content + TRIBE fusion | 2.1096866364 | 3.9271138224 | 0 | Primary candidate; failed gate, [E1] [E2] |
| Full network without TRIBE | 2.8143084253 | 5.5469094328 | 0 | Ablation, [E1] [E2] |
| Fusion with within-viewing shuffled training targets | 1.9646489699 | 3.5843826703 | 0 | Negative control; lower error than real-label fusion, [E1] [E2] |

Full fusion minus primary comparator: **+1.2573323155 normalized MAE**, descriptive 95% interval **[−0.0056696368, 2.7876280323]**. Relative error reduction **−147.5129%**, interval **[−305.4584%, 0.6877%]**. The point estimate is much worse; an interval crossing zero does not turn this into a success or equivalence result. [E1, lines 215–230][E1]

All seed results are retained; ensemble scores above average predictions, not seed MAEs. [E1]

| Arm | Seed 17 MAE | Seed 29 MAE | Seed 43 MAE |
|---|---:|---:|---:|
| TRIBE temporal | 0.858532 | 0.855574 | 0.859061 |
| Fusion | 2.116103 | 2.536274 | 2.700537 |
| Without TRIBE | 2.731875 | 3.314686 | 3.178667 |
| Shuffled fusion | 2.419557 | 2.746174 | 2.450551 |

Per-lecture normalized MAE, preserving the failure cases. Full six-arm lecture values and per-target MAE/normalized RMSE are in the report rather than only favorable examples. [E1, lines 3–213 and 315–347][E1]

| Lecture | Mean | TRIBE temporal | Fusion | Shuffled fusion |
|---|---:|---:|---:|---:|
| Atmospheric pressure/composition | 0.958613 | 0.972237 | 4.159441 | 3.475349 |
| Healing radiation | 0.872037 | 0.884124 | 0.874227 | 0.862137 |
| Ideal rocket equation | 0.795088 | 0.770032 | 0.766845 | 0.775321 |
| X-ray diffraction | 0.791315 | 0.783024 | 2.638234 | 2.745790 |

### Other reportable data points and unavailable endpoints

| Item | Value/result | Scope and source |
|---|---|---|
| Local training/evaluation people | 16 | Four-lecture subset; [M1] |
| Independent lectures / distinct supported content windows | 4 / 145 | Not 1,020 independent lessons; [M1] |
| Scheduled / supported viewings | 32 / 31 | One unsupported P2 X-ray viewing; [M1] [M20] |
| Supported EEG rows / extra sequence exclusions | 1,020 / 0 | Overlapping/repeated participant windows; [M1] |
| Targets / channels / context / query hop | 8 / 4 / 44 s / 5 s | Coarse recorded-value summaries; [M1] [M4] |
| v2 parameters | 16,296 per network; three-seed ensemble | Frozen upstream models excluded; [M1] |
| Artifact replay | 96 networks and 8 ridge models; 1,020 held rows | Saved audit passed; not human validation; [E5] |
| Metric recomputation | All six aggregate MAEs agree | Independent saved-metric audit; [E2] |
| Software verification | 79 passed, 1 skipped; separate Torch run 12 passed | Saved v2 logs, not newly executed in this audit; [E6] [E7] |
| Format qualification | Video, audio, text, image, PDF passed | Five presentations of one original velocity lesson, no measured neural/behavioral targets; [M2] [E3] |
| Supported fixture EEG queries | Video 3; audio 4; text/image/PDF 5 each | Context support checks, not predictive accuracy; [E3] |
| Cortex example | 721 time bins × 20,484 vertices | Actual rocket prediction; no measured-fMRI accuracy; [M26] |
| EEG and cortical arrays after reload/export | Exact replay; native cortex/clock unchanged | Engineering integrity; [E3] [M29] |
| v1 descriptive MAE ratio vs mean: progress / auxiliary / dense | 0.999462 / 5.116752 / 1.004235 | Historical descriptive cell/target ratios, **not the v2 metric**; [M2] |
| v1 ratios: auxiliary+dense / auxiliary+TRIBE / all blocks | 3.600374 / 4.780738 / 2.730059 | All comparisons retained; [M2] |
| v1 invalid all-block variance forecasts | 191 | Failure retained, not clipped away; [M2] |
| Posthoc v2 all-auxiliary-masked MAE | 0.8402387166 | Diagnostic on already-seen results, no retraining; **not a replacement benchmark or winning selected model**; [E8] |
| v3 completed primary score | | Completion/audit absent at snapshot; [V4] |
| Attention-difficulty MAE | | Behavioral model not fitted; [A7] [A4] |
| Quiz Brier / log loss | | Behavioral model not fitted; [A7] [A4] |
| Confusion or understanding accuracy | | No corresponding fitted, evaluated endpoint; [A4] [A7] |
| Measured-fMRI error/correlation vs TRIBE | | No local measured-fMRI test; [M1] [E1] |
| Human classroom-simulation fidelity | | Scripted paths, no human fidelity evaluation; [A4] |
| Teacher usability / learning-benefit study | | No report found in the inspected product/model artifacts; [A1] [A7] |

**Separate research, not Superclass benchmarks:** the standalone ALICE speech study reports a final one-listener/one-chapter simple-audio correlation 0.10178 and normalized MSE 1.392482, with 1.00234% lower error than its training mean. Its richer representation increased error by 1.79566% relative to simple audio. This is background evidence only, not a TRIBE comparison or validation of the competition pipeline. Earlier BBBD work includes preprocessing/synchrony and weak encoding pilots; none is pooled into the table above. [R1] [R2] [R3]

### Why the completed EEG result is weak

Confirmed posthoc evidence: v2 only guards against exactly zero feature standard deviations. A nearly constant training audio descriptor produced very large held-out standardized values; the saved diagnostic records an example magnitude 886.4 and a training feature scale around 0.00000418. Masking all auxiliary features reduced error in a diagnostic pass. This implicates unstable auxiliary transfer but does not prove one feature explains every failure. [M9] [E8]

Other established limits are two training lectures per topic holdout, overlapping contexts, unqualified acquisition timing/calibration/contact artifacts and no participant-specific predictor. The shuffled-target control doing better than the main fusion arm is evidence against claiming that this fusion has established useful content-to-EEG generalization. A prettier cortical animation cannot repair that result. [M1] [M23] [E1]

### Reproducibility receipts

| Saved evidence | SHA-256 verified during this audit |
|---|---|
| v2 benchmark `report.json` | `535eafc95a9ec73d286985d5957bbcb761c276dfbb7e68223a5e75a4bf4d104d` |
| v2 saved-model `audit.json` | `4333973ef6d735b53087a028e599ca44b5f2da17e694f5f8df8a7e854a64d3ca` |
| v2 model card | `a71072ae57886f00e9a571625f1c968cceaaecc0603d600e770a8780e1e7cbe4` |
| cached native TRIBE configuration | `a17212a257dfd91424e20a5fa8640d107fbbf79e842b6b2d72d17d24399dc9ef` |

The v2 handoff records source hashes, individual artifact checksums and test receipts. It includes local EEG weights and is marked local-only: do not copy the entire handoff directory onto a public website. ASR/alignment environment pinning and independent anatomical/timing qualification are incomplete even though core encoder/checkpoint revisions were verified. [E9] [M11] [M17]

## 9. Exact architecture diagram specification

Use **three separate lanes**. Legend: solid blue = implemented and execution evidenced; solid gray = implemented software path; dashed gray = planned/unconnected; amber badge = experimental or assumption; red annotation = failed predictive gate. Never use a single solid lesson→brain→agents→learning-results chain.

### Lane A — retained product backend

| Box ID and visible name | Incoming → outgoing transformation | Edge status |
|---|---|---|
| A0: “Teacher video, transcript, assessment” | Teacher entries → validated upload/version records | Implemented backend; workspace UI archived. [A2] |
| A1: “Transcript sections and keyword concepts” | A0 → parsed timestamps/sections + frequency-based concepts | Solid gray; deterministic, not a neural encoder. [A4] |
| A2: “Authored learner profiles” | Educator/default enum and misconception terms → profile records | Solid gray. [A5] |
| A3: “Scripted trajectory runner” | A1 + A2 + assessment prompts/options → bounded read/review/question/random-answer actions | Solid gray; label “up to 100 trajectories; no learned student state.” [A4] [A6] |
| A4: “Content checks and revisions” | A1 + assessments → practice/term-overlap hypotheses → proposed text checkpoint | Solid gray. Do **not** draw A3 as the cause of these checks; findings are computed independently. [A4] |
| A5: “Versioned evidence report” | A3/A4 records → trace viewer/export; behavior metrics unavailable | Solid gray for backend outputs; dashed to the active landing page. [A2] [A11] |

### Lane B — executed offline content→brain research pipeline

| Box ID and visible name | Incoming → outgoing transformation | Edge status |
|---|---|---|
| B0: “Authenticated source + explicit presentation clock” | Native media or text/page schedule → validated events and decoded media | Solid blue; assumed clocks amber for documents/text. [M5] [M16] |
| B1: “Frozen content encoders” | B0 → Llama 3.2 / W2v-BERT / V-JEPA2 tensors | Solid blue; label “Meta pretrained; not fine-tuned here.” [M11] |
| B2: “Frozen native TRIBE” | B1 → predicted cortical values | Solid blue; label “average-subject prediction.” [M6] |
| B3: “Video descriptors” | B0 → SAM visual, SAM Audio, Muse transcript/semantics and sensory/progress descriptors | Solid blue for video. Separate small branches; do not imply SAM produces brain activation. [M12] [M13] [M14] |
| B4: “Fold-fitted scaling/PCA + 44 s sequence” | B1 tensors + B2 predicted cortex → four 16-D blocks, 88 temporal bins and modality masks | Solid blue. Preserve native B2 clock separately. [M22] [M23] |
| B5: “Local EEG temporal ensemble · v2” | B4 → width-32 residual TCN → temporal mean pooling; B3 joins **after pooling** → eight-output head | Solid blue; red badge “predictive target not met.” [M9] [E1] |
| B6: “Predicted EEG summaries” | B5 → four means + four log-variances / five-second queries / support mask | Solid blue; no raw-waveform rendering. [M1] [M18] |
| B7: “Native predicted cortex” | B2 → unchanged 20,484-vertex array + native segment clock + offset metadata | Solid blue; no arrow from B5/B6 back into B2/B7. [M6] [M17] |
| B8: “Versioned research output bundle” | B6 + B7 → JSON/NPZ, identity, support and provenance | Solid blue; dashed edge to A5 labelled “product adapter not connected.” [M18] [A3] |

For audio/text/image/PDF, show only available B1 modalities and masks. B3 can appear as “supplemental extracted descriptors,” with **no solid B3→B5 edge for these formats**, because the current nonvideo v2 predictor does not consume them. [M5] [M19]

### Lane C — training and future research

- C0 “Recorded EduGage EEG + playback logs” → C1 “Coarse 44 s EEG summary targets” → C2 “Local EEG fitting/evaluation”: solid blue. B4/B3 training features also enter C2; C2 exports weights to B5. Label train/test separation across people and lessons. [M4] [M23]
- C3 “Upstream fMRI training — Meta” → B2 pretrained weights: separate upstream provenance arrow, **not a local dataset/training job**. [M6] [M8]
- C4 “Audited human attention/quiz labels” + B8/content → C5 “Behavioral predictor”: dashed, “planned; not fitted.” C5 → calibrated student-state/agent policy: dashed, “research hypothesis; no validated implementation.” [A7]
- C6 “v3 robustness revision”: small amber side box pointing to the EEG stage, labelled “implemented revision; completed score pending at audit.” No green success badge. [V3] [V4]

## 10. Data rights, populations and public examples

| Material | Verified provenance / restriction | Website implication |
|---|---|---|
| EduGage raw data | Figshare record, version 9 dated October 13, 2026, identifies CC BY 4.0 and raw, unprocessed sensor/player logs. Local targets/features are derivatives, not the authors' original cleaned benchmark. [Dataset record](https://figshare.com/articles/dataset/EduGage_Dataset/32145994); [M4] | Attribute release/authors and disclose transformations. Do not reuse the dataset's full participant-hour/label counts as the local model's training counts. |
| Population/consent | Paper reports 16 university students aged at least 18, IRB approval and informed consent. The actual signed consent instruments and public-display/commercial-use scope were not inspected. [Methods §3.1](https://arxiv.org/html/2605.01238v1#S3.SS1) | No demonstrated child, demographic, disability-specific, school-population or real-classroom generalization. Obtain rights/ethics clarification for proposed new uses. |
| Lecture media | Source receipts state private noncommercial research processing, no public redistribution or presentation, and no expanded copyright grant. [M30] | Do not place owner-hosted lecture video, audio, screenshots or transcripts on the public demo solely because local processing succeeded. |
| TRIBE | Model/code identify CC BY-NC 4.0. [Official license](https://github.com/facebookresearch/tribev2/blob/main/LICENSE); [M31] | Noncommercial restriction requires explicit review before monetized/otherwise commercial use; no commercial clearance is established here. Preserve attribution and investigate derivative-output/weight obligations with the rights holder/adviser. |
| Llama / SAM Audio | Llama 3.2 Community License and gated SAM License, respectively. [Llama card/license](https://huggingface.co/meta-llama/Llama-3.2-3B); [SAM Audio card](https://huggingface.co/facebook/sam-audio-small) | Access approval is not blanket relicensing. Full SAM license retrieval was gated in this audit; account/license owner must supply accepted terms. |
| Hosted Meta models / Modal | Actual inference uses external services. Content-only request contracts and separate local EEG fitting are implemented. [M16] [M28] | Do not advertise browser-only/private-local content processing. Review provider terms and retention before accepting sensitive teacher material. No provider contractual/privacy audit was performed. |
| Model/data artifacts | Product README prohibits publishing participant data, restricted media, secrets and checkpoints. Model handoff explicitly contains local EEG weights. [A1] [E9] | Publish approved aggregate numbers/copy, not `.local/`, raw signals, private receipts or the full handoff bundle. |
| Safer demo asset | Original project-authored velocity lesson is marked project-generated; its five-format fixtures have no participant recordings or labels. [M32] [M2] | Use after asset/voice ownership review. Label real model output on authored content, **no measured neural/learning ground truth**. |
| Historical BBBD research | Separate research notes distinguish official Zenodo from historical NEMAR artifacts and corrected questionnaire mappings. [R3] | Do not label historical derivative results as official-release results or add BBBD participants to Superclass's current EEG training count. |

No full commercial license matrix, author confirmation of exact historical lecture bytes, participant-display release, child-study approval or production privacy/security review was found in the inspected materials. This is a list of missing evidence, not a conclusion that all these uses are prohibited.

## 11. Research roadmap — future work, not website capability

1. **Finish the bounded v3 comparison and audit.** Preserve v2, all arms/seeds and failures. Completion requires forecast coverage, independent replay, metrics and uncertainty, plus deployment/format qualification. A lower score does not by itself establish brain-specific benefit. [V3] [V4]
2. **Resolve the measurement target.** Confirm media/version identity, quantify receiver-clock uncertainty, qualify EEG calibration/contact/artifacts and assess same-content reliability. Do not invent a hardware clock or call packet timestamps biological timing. [M4] [M26]
3. **Expand independent content and test transfer.** Obtain additional qualified lessons and participants, freeze whole-lesson/participant holdouts and a genuinely untouched evaluation. More overlapping windows are not more independent instructional diversity. [M1] [V3]
4. **Fit separately supervised behavioral models only after the audit gate.** The existing protocol specifies self-reported attention difficulty and valid pre/post quiz pairings, content-only versus predicted-EEG/TRIBE blocks, fold-local transforms and a dimension-matched content control. Confusion, retention and long-term transfer need new definitions/data. [A7]
5. **Connect the evidence bundle to the restored teacher workflow.** Add source/version/support provenance, honest unsupported states and a demonstrated end-to-end upload-to-report path before claiming the current app uses the model. [M18] [A3]
6. **Build learner-state simulation as a separate research contribution.** Define state, actions, knowledge exposure and update rules; evaluate human behavioral fidelity and learning responsiveness. The existing scripted runner supplies scaffolding, not proof of those capabilities. [A4]; [StudentSim](https://arxiv.org/abs/2609.01591)
7. **Test an EEG contribution to fMRI only on measured fMRI.** A prospective design needs matched stimuli, justified cross-modal alignment, a fixed native TRIBE baseline, an EEG-informed candidate, identical held-out fMRI targets and uncertainty. EMD/BOLD Moments is a candidate for investigation, not a dataset already ingested or a learning-outcome benchmark. [EMD paper](https://arxiv.org/abs/2608.28768)

## 12. Three website interactions grounded in the implementation

These are design specifications, not claims that the website already implements them.

### 1. “Follow one lesson through the research pipeline”

Use the original velocity fixture. A source picker switches video/audio/text/image/PDF; the graphic lights only the implemented modality arrows in Lane B. Selecting a stage reveals actual model ID, transformation and source clock. Native cortex and EEG summaries end in separate panels. Nonvideo auxiliary branches end at “supplemental,” not the EEG head. [M5] [M32]

Required visible labels: **“Recorded content; predicted neural summaries,” “Frozen Meta models,” “Local EEG head,” “Whole-lesson offline,” “Experimental transfer”** for nonvideo, and **“Not connected to the teacher backend yet.”** Do not animate a measured EEG waveform or claim a loading animation is real inference. Use saved outputs; label them cached.

### 2. “Two clocks, two kinds of prediction”

A playhead shows source time plus a shaded `[q−44,q)` EEG context. Only supported five-second query points appear; unsupported points are gaps with a reason. A separate cortical panel advances on native TRIBE segments and exposes the five-second neuro-offset metadata. For PDFs, a page-duration slider is explicitly an assumed presentation control; changing it must not pretend to recompute the model unless a new run really occurs. [M4] [M5] [M6] [M18]

Required labels: **“Predicted channel mean” / “Predicted log1p variance,” “Not raw EEG,” “Native TRIBE cortical prediction,” “Average-subject model,” “Assumed page timing—not measured reading,” “Coverage ≠ confidence.”** Color values consistently; no automatic per-frame rescaling that invents stronger changes. [M17]

### 3. “Inspect the evidence, including failures”

Provide tabs for **engineering checks**, **EEG benchmark**, and **behavioral roadmap**. Engineering shows the five-format replay status. EEG shows all six v2 bars on one honest axis, selectable lecture and target, with baseline, primary comparator and shuffled control always visible. An uncertainty tooltip explains four-lecture descriptive resampling. Behavioral panels show blank scores and the audit gate. A separate v3 badge stays pending until completed artifacts exist. [E1] [E2] [E3] [A7] [V4]

Required labels: **“Lower error is better,” “Exploratory reanalysis,” “4 lectures · 16 participants,” “Success target not met,” “EEG transfer comparison—not fMRI superiority,” “Behavioral validation pending.”** Do not turn error into an “accuracy %,” hide negative controls, or substitute the posthoc 0.8402 diagnostic as the headline result.

## 13. Approved website copy

“Approved” here means supported by this audit, not legal approval. Keep the source links in the research/evidence section or attached footnotes. Scope qualifiers are part of the copy.

### How it works

> Superclass is researching ways to review lessons before they reach a classroom. Our educator prototype organizes videos, transcripts and questions, then produces inspectable, scripted learner paths and content-review suggestions. A separate research pipeline explores how lesson content relates to EEG-derived summaries and pretrained cortical-response predictions. These components are not yet a validated predictor of student learning. [A1] [A4] [M1]

### Model

> Our research pipeline combines frozen Meta language, audio and vision representations with a small EEG-trained prediction model. It estimates four channel means and four log-variance features over 44-second contexts. A separate, unchanged TRIBE model supplies predicted average-subject cortical responses. The outputs do not measure an individual student's attention, confusion or understanding. [M1] [M9] [M11]

### Data

> Our completed EEG experiment uses a qualified subset of four EduGage lectures: 16 participants and 31 supported viewings. TRIBE contributes externally pretrained fMRI-response representations; we have not jointly trained a model on measured EEG and fMRI from these learners. Reading and document inputs use explicit timing assumptions and remain experimental transfer cases. [M1] [M5] [M24]

### Evaluation

> We separate successful execution from predictive accuracy. Our v2 pipeline passed saved-model replay and five-format integration checks, but full fusion did not beat its EEG baselines: normalized MAE was 2.110, compared with 0.852 for the TRIBE-derived EEG comparator and 0.854 for the training mean. These are exploratory results from four previously evaluated lectures. Attention, learning outcomes and superiority on measured fMRI have not been validated. [E1] [E2] [E3] [A7]

Suggested short descriptor: **“A research prototype for evidence-aware lesson review.”** Avoid “the first,” “digital students that learn like your class,” “attention from brain signals,” “sentence-level understanding,” and “outperforms Meta TRIBE.”

## 14. Missing evidence and who can supply it

| Missing material / unresolved question | Why it matters | Likely supplier |
|---|---|---|
| Completed v3 evaluation manifest, all forecasts, benchmark/audit, deployment and qualification | Cannot publish a score or passed gate from partial fits | Competition model maintainer / active research thread; expected under `fusion-v3-*` |
| Product adapter invoking the research entrypoint and end-to-end request/result receipt | Cannot show a solid brain-model→teacher-workflow arrow | Product backend owner and model integration owner |
| Signed-off behavioral audit, valid quiz keys/pairings, label exclusions and fold-local head artifacts | Required for attention-difficulty or comprehension proxy claims | Behavioral experiment owner; EduGage authors for unclear release semantics |
| Verified physical acquisition clock, latency information and EEG calibration/contact-QC interpretation | Determines what temporal/neural claims the targets can support | EduGage authors Zikang Leng / Edan Eyal / Thomas Plötz; acquisition-system documentation |
| Confirmation of media/version correspondence to the actual viewed stimuli | File hashes authenticate today's inputs, not necessarily historic presentation bytes | EduGage experiment authors and media rights holders; native qualifier currently marks historical media identity false [M26] |
| Exact TRIBE released-checkpoint training lineage, relationship between 25 subject layers and paper-wide 720-subject corpus | Avoid assigning upstream paper scale/performance to the wrong artifact | TRIBE maintainers/authors Stéphane d'Ascoli / Jérémy Rapin / Jean-Rémi King |
| Measured fMRI benchmark matched to licensed stimuli and a frozen comparison protocol | Required for “EEG improves TRIBE fMRI” | Research owner plus a qualified public dataset curator or fMRI collaborator |
| Trained agent policy/state transitions and human simulation-fidelity benchmark | Required for learned classroom or persona claims | Agent research owner; educators and participating learners under an approved study |
| Full accepted model/API licenses, commercial permissions and asset-specific display rights | Current private research receipts do not clear commercial/public demos | Account/license holder, Meta/rightsholders, media owners and qualified adviser |
| Teacher usability study, prospective learning outcomes, age/population coverage | Required for educational effectiveness/generalization claims | Educator collaborators, study lead and appropriate ethics review |

No clarification from the user was needed to document these gaps. None was silently filled with a plausible architecture.

## 15. Line-specific evidence ledger

Links below point to the exact local file and starting line; ranges describe the inspected supporting span. Local `.local` links are internal evidence references, **not links to publish on the public site**. The eight-claim table above is the decision ledger; this catalog resolves each supporting identifier.

| ID | File and inspected lines | Evidence / limitation |
|---|---|---|
| A1 | [Product README, 1–42][A1] | Active landing/archived UI; workflow and research boundaries; no validated behavior. |
| A2 | [Product API, 23–335][A2] | Upload limits, versioning, profiles/runs, report/export, SSE. |
| A3 | [Product adapter, 1–29][A3] | Readiness/cache identity only; no fitted-model invocation. |
| A4 | [Product logic, 24–183][A4] | Deterministic analysis, scripted runner, random answer choice, unavailable metrics, content checks. |
| A5 | [Product schemas, 12–126][A5] | Inputs, profiles, actions, prediction/status types and caps. |
| A6 | [Worker, 10–72][A6] | Sequential trajectories, resume/cancellation, 100 cap. |
| A7 | [Behavioral protocol, 1–30][A7]; [audit, 1–19][A7b] | Pending label/media audit, endpoints, folds and claim gate. |
| A8 | [Contribution boundary, 1–11][A8] | Product/research separation and no calibrated adapter. |
| A9 | [Workflow test, 21–94][A9] | Tested assertions; not a new test execution receipt. |
| A10 | [Archived Lab, 246–289][A10] | Illustrative surface, local CSV/NIfTI; not model output. |
| A11 | [Current page, 8–35][A11]; [Research panels, 4–18][A11b] | Current marketing/UI placeholders; excluded as capability evidence. |
| M1 | [v2 model card, 1–78][M1] | Architecture/data/targets/limits, failed criterion and uncertainty. |
| M2 | [v1 model card, 1–86][M2] | Ridge architecture, historical scores, invalid values, five-format scope. |
| M3 | [Corpus registry, 1–90][M3] | Four media mappings and feature artifacts. |
| M4 | [EEG targets, 1–7, 71–101, 104–202][M4] | Exact receiver-position operator, moments, gaps, source verification. |
| M5 | [Content pipeline, 51–152][M5] | Formats, clocks, nonvideo auxiliary exclusion, transfer flags. |
| M6 | [Native inference, 70–138][M6] | Frozen TRIBE/capture replay, native arrays, average subject, limits. |
| M7 | [v2 deployment, 1–35][M7] | Trained ensemble identity; no fMRI update or individualization. |
| M8 | [Pinned TRIBE config, 142–143, 485–560][M8] | Output clock, Transformer and subject-layer architecture, MSE. |
| M9 | [EEG network, 15–38, 57–132, 148–227][M9] | Scaling, TCN, positive head, dropout, training and replay. |
| M10 | [Presentation events, 1–136][M10] | Assumed word/page schedule and native event creation. |
| M11 | [Native model code, 14–138 and 143–230][M11] | Pinned checkpoints and actual TRIBE/SAM Audio execution. |
| M12 | [Meta feature code, 21–118 and 125–190][M12] | Hosted semantic and segmentation calls, quote checks. |
| M13 | [Auxiliary windows, 22–129][M13]; [feature classes, 20–21][M13b] | Semantic, SAM and separation feature derivation. |
| M14 | [Meta Voice, 24–64 and 80–129][M14] | Transcription endpoint, chunk clock, no word timestamps. |
| M15 | [Upstream pins, 1–28][M15]; [Meta corpus qualification, 1–47][M15b] | Checkpoint identity; real four-lecture descriptors. Some config status fields are stale. |
| M16 | [Worker contract, 1–54][M16] | Content-only request shape, formats/provenance/hash checks. |
| M17 | [Surface export, 50–90][M17] | Cortex/clock preservation, no ROI or individual anatomy claim. |
| M18 | [JSON export, 11–36][M18] | Null/support treatment, separate cortical arrays, no behavioral scores. |
| M19 | [Fusion inference, 90–172][M19] | CPU bridge, masks, predictions, experimental provenance. |
| M20 | [Target qualification, 1–59][M20] | 32 processed cases versus unsupported P2 X-ray. |
| M21 | [Dense capture, 1–61][M21] | Pre-projection feature tensors; no model mutation. |
| M22 | [Sequence assembly, 10–11, 31–105][M22] | Modalities/aux blocks, cortex inputs, coverage-weighted grid. |
| M23 | [Frozen v2 protocol, 1–26][M23] | Hyperparameters, seeds, arms, weighting, metrics and success rule. |
| M24 | [Deployment manifest, 21–35][M24] | Full-fit data count and explicit failed evaluation/domain flags. |
| M25 | [TRIBE event adapter, 1–74][M25] | Documented deviation from pinned upstream preprocessing. |
| M26 | [Rocket native qualification, 1–47][M26] | Real outputs, zero capture discrepancy, remaining timing/identity limits. |
| M27 | [SAM Audio smoke qualification, 1–23][M27] | Actual separation arrays, no accuracy validation. |
| M28 | [Modal workers, 19–32, 43–73, 85–143][M28] | GPU deployment/resource declarations and content-only execution. |
| M29 | [Surface qualification, 1–11][M29] | Exact values/clocks; no scientific validation. |
| M30 | [Rocket media receipt in native manifest, 3–14][M30] | Private noncommercial use basis, no public redistribution. |
| M31 | [Cached upstream model card, 1–34, 120–122][M31] | Attribution, frozen model role and noncommercial license. |
| M32 | [Original fixture manifest, 1–21][M32] | Project-generated source and no scientific accuracy claim. |
| M33 | [Video fixture qualification, 1–18][M33] | 65 cortical rows; no measured neural or behavioral targets. |
| M34 | [Fusion experiment, 89–136 and 160–244][M34] | Unique-training-content transforms, separation checks, save-before-score and deployment. |
| E1 | [v2 benchmark report, 1–375][E1] | All arms/targets/seeds/lectures, comparisons, uncertainty and failed gate. |
| E2 | [Independent metric audit, 1–38][E2] | All six recomputed MAEs agree. |
| E3 | [v2 format qualification, 1–125][E3] | Five-format execution/reload; no independent neural accuracy. |
| E4 | [v2 metrics CSV, 1–7][E4] | Full six-arm aggregate MAEs. |
| E5 | [v2 artifact audit, 1–16 and 675–680][E5] | Train-only transforms/replay, 96 networks/8 ridge models. |
| E6 | [v2 base test receipt, 1–9][E6] | 79 passed/1 skipped. |
| E7 | [v2 Torch test receipt, 1–2][E7] | 12 passed. |
| E8 | [Posthoc diagnostic, 1–24 and 677–679][E8] | Auxiliary shift/masking; explicitly not new validation. |
| E9 | [Handoff manifest, file hashes and local-only flags][E9] | Source/artifact receipts; private EEG weights included. |
| V3 | [v3 frozen revision, 1–42][V3] | Repair design, same dataset, no fMRI modification. |
| V4 | [v3 started manifest, 1–14][V4] | Incomplete evaluation at snapshot; cannot substitute for final report. |
| R1 | [Standalone README, 1–7 and 109–122][R1] | No affiliation; separate final speech benchmark. |
| R2 | [Prior-art audit, 3–29 and 53–93][R2] | Existing encoding work and narrower proposed contribution. |
| R3 | [Dataset notes, 8–40, 83–99][R3] | BBBD source-of-record, historical derivatives, stimulus/data limitations. |

### Document conflicts resolved in this audit

- Product README/audit describe an earlier unmounted-volume blocker. The volume was available for this audit; that stale sentence is not a current execution status. The **behavioral model still has no fitted evidence**, independently confirmed by backend logic and the uncompleted protocol gate. [A1] [A3] [A4] [A7]
- `brain_pipeline_v1.json` says “implementation_in_progress_not_fitted,” and `brain_upstream_pins.json` has older unqualified flags. Later fitted manifests and execution receipts demonstrate v1/v2 execution; their explicit scientific limitations remain in force. [M2] [M15] [M24] [E3]
- Current website diagrams, sine-wave panels and “validation pending” displays were inspected only to identify placeholders. They are not sources for model architecture, training size or benchmark results. [A11b]
- The local research path's generic “brain model” naming does not establish a world model. The completed model is an offline conditional predictor, without a learned evolving classroom state. This is an interpretation of the inspected forward/training and simulator code. [M9] [A4]

[A1]: /Users/Aayush/MetaHackathon/README.md:3
[A2]: /Users/Aayush/MetaHackathon/backend/api.py:23
[A3]: /Users/Aayush/MetaHackathon/backend/adapter.py:9
[A4]: /Users/Aayush/MetaHackathon/backend/logic.py:24
[A5]: /Users/Aayush/MetaHackathon/backend/models.py:12
[A6]: /Users/Aayush/MetaHackathon/backend/worker.py:10
[A7]: /Users/Aayush/MetaHackathon/docs/behavioral_protocol_v1.json:3
[A7b]: /Users/Aayush/MetaHackathon/docs/behavioral_audit.md:1
[A8]: /Users/Aayush/MetaHackathon/docs/contributions.md:3
[A9]: /Users/Aayush/MetaHackathon/tests/test_workflow.py:21
[A10]: /Users/Aayush/MetaHackathon/archive/vite-frontend/src/BrainTest.tsx:246
[A11]: /Users/Aayush/MetaHackathon/frontend/app/page.tsx:8
[A11b]: /Users/Aayush/MetaHackathon/frontend/app/Research.tsx:4
[M1]: </Volumes/EEG Research Workspace/MetaHackathon/docs/brain_model_card_v2.json:1>
[M2]: </Volumes/EEG Research Workspace/MetaHackathon/docs/brain_model_card_v1.json:1>
[M3]: </Volumes/EEG Research Workspace/MetaHackathon/.local/brain-corpus-execution-v2.json:1>
[M4]: </Volumes/EEG Research Workspace/MetaHackathon/brain/edugage_targets.py:1>
[M5]: </Volumes/EEG Research Workspace/MetaHackathon/brain/content_pipeline.py:51>
[M6]: </Volumes/EEG Research Workspace/MetaHackathon/brain/remote_inference.py:70>
[M7]: </Volumes/EEG Research Workspace/MetaHackathon/.local/brain-runs/fusion-v2-deployment/manifest.json:1>
[M8]: </Volumes/EEG Research Workspace/MetaHackathon/.local/meta-resources/model-cards/tribev2/config.yaml:142>
[M9]: </Volumes/EEG Research Workspace/MetaHackathon/brain/fusion_model.py:15>
[M10]: </Volumes/EEG Research Workspace/MetaHackathon/brain/presentation.py:1>
[M11]: </Volumes/EEG Research Workspace/MetaHackathon/brain/remote_inference.py:14>
[M12]: </Volumes/EEG Research Workspace/MetaHackathon/brain/meta_features.py:21>
[M13]: </Volumes/EEG Research Workspace/MetaHackathon/brain/auxiliary_windows.py:22>
[M13b]: </Volumes/EEG Research Workspace/MetaHackathon/brain/lesson_meta.py:20>
[M14]: </Volumes/EEG Research Workspace/MetaHackathon/brain/meta_voice.py:24>
[M15]: </Volumes/EEG Research Workspace/MetaHackathon/configs/brain_upstream_pins.json:1>
[M15b]: </Volumes/EEG Research Workspace/MetaHackathon/.local/brain-runs/meta-corpus-feature-qualification-v1.json:1>
[M16]: </Volumes/EEG Research Workspace/MetaHackathon/brain/worker_contract.py:1>
[M17]: </Volumes/EEG Research Workspace/MetaHackathon/brain/surface.py:50>
[M18]: </Volumes/EEG Research Workspace/MetaHackathon/brain/fusion_export.py:11>
[M19]: </Volumes/EEG Research Workspace/MetaHackathon/brain/fusion_inference.py:90>
[M20]: </Volumes/EEG Research Workspace/MetaHackathon/.local/brain-runs/corpus-target-qualification-v1/summary.json:1>
[M21]: </Volumes/EEG Research Workspace/MetaHackathon/brain/dense_capture.py:1>
[M22]: </Volumes/EEG Research Workspace/MetaHackathon/brain/fusion_data.py:10>
[M23]: </Volumes/EEG Research Workspace/MetaHackathon/configs/brain_fusion_v2.json:1>
[M24]: </Volumes/EEG Research Workspace/MetaHackathon/.local/brain-runs/fusion-v2-deployment/manifest.json:21>
[M25]: </Volumes/EEG Research Workspace/MetaHackathon/brain/tribe_events.py:1>
[M26]: </Volumes/EEG Research Workspace/MetaHackathon/.local/brain-runs/ideal_rocket_equation-native-qualification-v1.json:1>
[M27]: </Volumes/EEG Research Workspace/MetaHackathon/.local/brain-runs/sam-audio-live-smoke-v5/qualification.json:1>
[M28]: </Volumes/EEG Research Workspace/MetaHackathon/cloud/modal_brain.py:19>
[M29]: </Volumes/EEG Research Workspace/MetaHackathon/.local/brain-runs/rocket-surface-export-v1/qualification.json:1>
[M30]: </Volumes/EEG Research Workspace/MetaHackathon/.local/brain-runs/rocket-native-brain-v4/manifest.json:3>
[M31]: </Volumes/EEG Research Workspace/MetaHackathon/.local/meta-resources/model-cards/tribev2/README.md:1>
[M32]: </Volumes/EEG Research Workspace/MetaHackathon/.local/brain-runs/full-video-qualification-v1/manifest.json:1>
[M33]: </Volumes/EEG Research Workspace/MetaHackathon/.local/brain-runs/full-video-qualification-v1/qualification.json:1>
[M34]: </Volumes/EEG Research Workspace/MetaHackathon/brain/fusion_experiment.py:89>
[E1]: </Volumes/EEG Research Workspace/MetaHackathon/.local/brain-runs/fusion-v2-benchmark/report.json:1>
[E2]: </Volumes/EEG Research Workspace/MetaHackathon/.local/brain-runs/fusion-v2-audit/metric-audit.json:1>
[E3]: </Volumes/EEG Research Workspace/MetaHackathon/.local/brain-runs/fusion-v2-qualification/qualification.json:1>
[E4]: </Volumes/EEG Research Workspace/MetaHackathon/.local/brain-runs/fusion-v2-benchmark/metrics.csv:1>
[E5]: </Volumes/EEG Research Workspace/MetaHackathon/.local/brain-runs/fusion-v2-audit/audit.json:1>
[E6]: </Volumes/EEG Research Workspace/MetaHackathon/.local/brain-runs/fusion-v2-handoff/fusion-v2-tests-final-base.log:1>
[E7]: </Volumes/EEG Research Workspace/MetaHackathon/.local/brain-runs/fusion-v2-handoff/fusion-v2-tests-torch.log:1>
[E8]: </Volumes/EEG Research Workspace/MetaHackathon/.local/brain-runs/fusion-v2-posthoc-diagnostics/diagnostics.json:1>
[E9]: </Volumes/EEG Research Workspace/MetaHackathon/.local/brain-runs/fusion-v2-handoff/handoff-manifest.json:1>
[V3]: </Volumes/EEG Research Workspace/MetaHackathon/configs/brain_fusion_v3.json:1>
[V4]: </Volumes/EEG Research Workspace/MetaHackathon/.local/brain-runs/fusion-v3-evaluation/started.json:1>
[R1]: </Users/Aayush/Workspace/Nueroscience Research/README.md:1>
[R2]: </Users/Aayush/Workspace/Nueroscience Research/docs/prior_art_data_code_novelty_audit.md:3>
[R3]: </Users/Aayush/Workspace/Nueroscience Research/docs/dataset_notes.md:8>
