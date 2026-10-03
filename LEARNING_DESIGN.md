# Learning design

How Word Path teaches, why, and where it falls short. Every learning decision in the backlog should trace back to this document. It's a working draft: revise it as research is reviewed and children are observed.

## Who it's for

- **Children aged roughly 5–8 (kindergarten to grade 2)** learning to read words, at their own pace.
- **Used individually** (the main design case), and **teacher-led with a small group** (a second case: big screen, the teacher picks the level, children answer together).
- Children who can't read instructions yet, so **everything is spoken**.

## What the game does, and doesn't, cover

The **Simple View of Reading** (Gough & Tunmer, 1986) describes reading comprehension as the product of two abilities: **word recognition** (decoding) and **language comprehension**. **Scarborough's Reading Rope** (2001) breaks word recognition into **phonological awareness, decoding and sight recognition**, which become increasingly automatic.

**Word Path works on word recognition only.** Vocabulary, background knowledge and comprehension matter just as much, but they belong to books, talk and teaching. The game should say so plainly to teachers and families.

## Principles

Each principle has a source, what the game does today, and the related backlog items.

| # | Principle | Source | Today | Backlog |
|---|---|---|---|---|
| 1 | **Systematic, explicit phonics**: teach letter–sound relationships in a planned order, from simple to complex, with each new sound building on the last | National Reading Panel (2000); Foorman et al. (2016), rec. 3; Castles, Rastle & Nation (2018) | ✅ 7 stages in a fixed sequence; coverage check enforces order | #14 bands |
| 2 | **Phonemic awareness, linked to letters**: hearing and manipulating the sounds in words, practised alongside letters rather than only in isolation | Ehri et al. (2001); Foorman et al. (2016), rec. 2 | ⚠️ First-sound sorting, rhyme, blending. No segmenting, syllables or sound manipulation | #23 segmenting, #26 early PA |
| 3 | **Decoding means blending every sound**: children must use all the letters in a word, not guess from the first letter or a picture | Ehri (2005): partial vs full alphabetic phase | ⚠️ Fixed: wrong options now sound like the answer, and a letter's usual mix-up (b/d, p/q, m/n, short e/i) is offered once both are taught; a spelling of the same sound (c / ck) never is, and pictures likely to be misnamed are never wrong answers (`CONFUSIONS` in content.js; the pairs are standard classroom guidance, to verify in the R1 follow-up). Picture names still need review | #2 (done), #3 pictures |
| 4 | **Decodable practice**: early reading uses only words made of sounds already taught | Foorman et al. (2016), rec. 3–4 | ✅ Coverage check rejects any blending/reading word using an untaught sound. Wrong *pictures* can be any picture word: the child reads or blends only the answer | — |
| 5 | **Spelling (encoding) supports reading**: building words from sounds strengthens word reading | Graham & Santangelo (2014); Foorman et al. (2016), rec. 3 | ❌ Not yet | #24 spelling |
| 6 | **Sight words through orthographic mapping**: words become instantly recognisable when children connect their letters to their sounds, not by memorising shapes. Most high-frequency words are largely decodable | Ehri (2014) | ⚠️ Sight words are taught as whole words to pop | #25 heart words |
| 7 | **Connected text**: apply decoding in sentences and short texts, not only single words | Foorman et al. (2016), rec. 4 | ❌ Words only | #32 decodable sentences |
| 8 | **Retrieval and spaced, cumulative practice**: recalling earlier material at spaced intervals improves retention more than massed practice | Cepeda et al. (2006); Roediger & Karpicke (2006); Seabrook et al. (2005) | ✅ Plays work through unseen items first; later levels review earlier items (still-learning first); mastery requires success on 2 different days | — |
| 9 | **Accuracy before moving on**: progress should reflect what a child can do on the first try, not what they reach by elimination | Mastery-learning practice; Foorman et al. (2016) on monitoring progress; Kim et al. (2023) | ✅ First-try mastery tracked per word and sound; guessing can't win a round (the answer is shown after misses); "Practise again" offered under 50% | — |
| 10 | **Immediate, specific feedback**: tell the child what their answer was and model the correct one, rather than a bare "wrong" | Hattie & Timperley (2007) | ✅ Says what the wrong choice was; after two misses shows and says the answer; praise names what was right | — |
| 11 | **Pure sounds**: letter sounds are said without an added "uh" (/m/, not "muh"), so blending works | Common practice in structured literacy; NRP (2000) on phonemic awareness | ✅ Human recordings of all 43 sounds | #9 re-records |
| 12 | **Motivation without distraction**: rewards should mark effort and progress, not compete with the learning | General instructional design | ✅ Stickers per level; little on-screen clutter | #22 group mode |

## Developmental bands (proposal)

Grade labels are rough: children move through these at different ages. **Placement should follow what a child can do** (once mastery tracking exists), not their grade. The bands follow **Ehri's phases of word reading** (2005).

| Band | Ehri phase | Skills | Today's stages | To add |
|---|---|---|---|---|
| **A: Getting started** (≈ K) | Pre-alphabetic → partial alphabetic | Rhyme, syllables, first sounds; all letter names and their most common sounds; blending and segmenting 2–3 sound words; first high-frequency words | 1–4 | Syllables and first/last sound games (#26), segmenting (#23), simple spelling (#24) |
| **B: Reading words** (≈ grade 1) | Full alphabetic | Digraphs (sh ch th ng ck wh); consonant blends (st, fr, -nd…); magic e; common vowel teams; ending -s; decodable sentences | 5–7 | **Consonant blends** (a gap today), -s endings, sentences (#32) |
| **C: Reading fluently** (≈ grade 2) | Consolidated alphabetic | Remaining vowel teams and diphthongs (ou, oy, au, ew); r-controlled vowels (ir, ur); endings -ed and -ing (with doubling and dropping e); two-syllable and compound words; common prefixes and suffixes | — | All of it |

**Gaps this exposes:**
- **Consonant blends** (st, sp, fr, cl, -nd, -mp) aren't taught as a step, although some words (snake, star, spoon, tree) use them. They belong early in band B, or late in band A.
- **Band C doesn't exist yet.**
- **Segmenting and spelling** are missing throughout.

## Where content comes from

- **Our own work:** word lists, pictures and sentences are chosen for Word Path. No material from commercial programmes (for example UFLI Foundations, Fundations, Jolly Phonics): their word lists, passages, slides, lesson structures and names aren't used.
- **The teaching order** is a sequence of ideas, modelled on the UK Department for Education and Skills' *Letters and Sounds* (2007) phases, and consistent with the principles above. Alignment with programmes schools use (such as UFLI) is a research item (R3).
- **Sight words:** Fry's first 300 (Fry, 1980). For a product, review against the Dolch list or public word-frequency data (see FUTURE.md).
- **Pictures:** Noto Emoji (Apache 2.0). **Fonts and icons:** Fredoka (SIL OFL), Lucide (ISC).
- **Speech sounds:** recorded by the project author.

## Literature review (R1, first pass)

A first pass over the evidence most relevant to a phonics game for ages 5–8, focused on meta-analyses, large trials and practice guides. Numbers are taken from published abstracts and study pages; items marked *(verify)* need checking against the full paper before citing publicly. This is a starting point, not a systematic review.

### 1. Do educational apps and digital phonics practice work?

- **Modest positive effects, mostly on "constrained" skills.** A meta-analysis of 36 rigorous studies of apps for preschool to grade 3 found an average effect of **+0.31 SD**, similar for literacy and maths. Effects were **larger for preschoolers than for K–3**, **larger on researcher-made tests than standardised tests**, and **larger for constrained skills** (letter knowledge, phonics) than unconstrained ones like comprehension (Kim, Gilbert, Yu & Gale, 2021).
- **K–5 technology interventions** (119 studies, 2010–2023) improved **decoding by 0.33 SD**, falling to **0.23 SD on standardised measures**. Language and reading comprehension effects were smaller (Silverman et al., 2025).
- **Touchscreen learning for 0–5-year-olds** showed an average effect of **d = 0.46** across 36 studies, varying with age, subject, comparison group and setting (Xie et al., 2018).
- **GraphoGame**, the most-studied phonics game, is mixed. Smaller randomised trials found gains in letter sounds, word reading and spelling, including for children at risk of dyslexia. But a large, high-security UK trial (398 Year 2 pupils with low phonics scores) found **no added benefit over the small-group and one-to-one support the comparison group received**, even though teachers and pupils found it highly engaging (EEF/NFER, 2021).

**What this means for Word Path**
- Expect real but **modest** gains, concentrated on exactly what the game teaches (letter–sound knowledge, decoding). Don't promise reading comprehension.
- A game is a **supplement to teaching, not a replacement**. The EEF result shows that well-delivered small-group support can do as well.
- **Engagement isn't evidence of learning.** Children enjoying it (as they did GraphoGame Rime) doesn't mean they're learning more. We need to measure learning separately (new item R8).

### 2. Spacing and review

- Spreading practice out beats massing it, across ages and materials (Cepeda et al., 2006, already in principle 8).
- **In real classrooms, for reading:** distributing short phonics practice across the day produced better learning than clustering the same amount into one lesson (Seabrook, Brown & Solity, 2005, Experiment 3).

**What this means:** cumulative review (#16) and mastery that requires success **on more than one day** (#12) are well supported. Short, frequent sessions beat long, rare ones.

### 3. When is a word "mastered"? (R4)

- Judging mastery **item by item** (each word on its own) is more efficient than waiting for a whole set to reach criterion. Mastered words drop out early, saving practice time without losing retention (Wong et al., 2022 *(verify)*).
- With four second graders learning sight words, a criterion of **three consecutive correct responses per word** led to the fastest learning, and words were still known two weeks later, compared with five-in-a-row criteria (Kim et al., 2023 *(verify)*). These are very small studies.

**What this means:** our placeholder (per word, 3 first-try correct of the last 4, across at least 2 days) fits this evidence. It's per item, uses about 3 correct responses, and the 2-day condition adds the spacing benefit from section 2. **Keep it**, as an easy-to-change setting, and revisit it once we have real data on how quickly children reach it and whether mastered words stay mastered.

### 4. How long should a session be? (R5)

- GraphoGame recommends about **15 minutes, 3 times a week**. In one study, 5½-year-olds sustained a median of 15 minutes per session over three months (GraphoGame research summaries *(verify primary source)*).

**What this means:** aim for **10–15 minute sessions**, roughly 2–3 of our levels. Possible features: a gentle "great work today" stopping point after about 15 minutes, and a grown-up setting for session length. Check against how long levels actually take once usage data exists.

### 5. Feedback and errors

- Feedback is among the most powerful influences on learning when it tells learners **where they are and what to do next**. Praise alone does little (Hattie & Timperley, 2007).
- For early readers, correcting an error by **modelling the right answer** is better than letting a child guess until something works. That's what #13 does.

### 6. Rewards and motivation

- A meta-analysis of 128 experiments found that **expected, tangible rewards given for doing or completing a task reduce intrinsic motivation**, more so for children than for adults. **Positive, informational feedback increased** motivation (Deci, Koestner & Ryan, 1999).

**What this means:** stickers are an expected reward for completing a level, which is the kind most likely to backfire if they become the point. Keep them light and collectable; make spoken praise **informational** ("You read five new words!", "You know the sound sh now") rather than generic ("Great job!"); and avoid escalating rewards (new item R9).

### 7. What makes an app "educational" for young children

- Children learn best from apps that are **active** (minds-on, not just tapping), **engaging** (focused on the learning, with few distractions), **meaningful** (connected to their lives) and **socially interactive** (with adults or peers), around a clear learning goal (Hirsh-Pasek et al., 2015).
- An analysis of popular children's "educational" apps found most scored low on these pillars, especially for scaffolding and feedback (Meyer et al., 2021).
- In the touchscreen meta-analysis, **adult involvement** was among the factors linked to stronger effects (Xie et al., 2018 *(verify the moderator details)*).

**What this means:** Word Path does well on "active" and "engaged" (clear goal, every tap is a decision, little clutter). It's weak on **social** and **meaningful**. Teacher-led group mode (#22), simple prompts for grown-ups ("Ask your child to find something at home that starts with s"), and connecting to real reading through decodable sentences (#32) would address both.

### Changes this suggests

- **Keep** the mastery placeholder (R4 answered for now; revisit with data).
- **New R8: evaluation plan.** How we'll know Word Path helps: a short pre/post check of letter sounds and decoding, ideally with a comparison group, before claiming impact.
- **New R9: reward design.** Informational praise, light-touch stickers, no escalation.
- **New: session length.** A gentle stopping point after about 15 minutes, and a grown-up setting.
- **New: grown-up prompts.** Short, optional off-screen activities after a level, for families and teachers (the social and meaningful pillars).

## Open research questions

Tracked as R1–R9 in BACKLOG.md; R1, R4 and R5 have a first answer in the literature review above. Summary:

1. **Programme alignment (R3):** how much would matching a school's sequence (e.g. UFLI) help children, and what's allowed without using its materials?
2. **Picture naming (R2):** which pictures do children actually name as intended? Answer by watching children, not only by review.
3. **Mastery threshold:** is "3 first-try correct of the last 4, over 2 days" right for this age? Compare with published practice.
4. **Session length:** how many rounds hold attention for a 5-year-old vs an 8-year-old?
5. **Group mode:** what does teacher-led use need that individual play doesn't (choral responses, pacing, a pause button)?

## References

Verify details before citing publicly.

- Castles, A., Rastle, K., & Nation, K. (2018). Ending the reading wars: Reading acquisition from novice to expert. *Psychological Science in the Public Interest, 19*(1), 5–51.
- Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., & Rohrer, D. (2006). Distributed practice in verbal recall tasks: A review and quantitative synthesis. *Psychological Bulletin, 132*(3), 354–380.
- Deci, E. L., Koestner, R., & Ryan, R. M. (1999). A meta-analytic review of experiments examining the effects of extrinsic rewards on intrinsic motivation. *Psychological Bulletin, 125*(6), 627–668.
- Department for Education and Skills (2007). *Letters and Sounds: Principles and practice of high quality phonics.* London: DfES.
- Education Endowment Foundation / NFER (2021). *GraphoGame Rime: Evaluation report and executive summary.* London: EEF.
- Ehri, L. C. (2005). Learning to read words: Theory, findings, and issues. *Scientific Studies of Reading, 9*(2), 167–188.
- Ehri, L. C. (2014). Orthographic mapping in the acquisition of sight word reading, spelling memory, and vocabulary learning. *Scientific Studies of Reading, 18*(1), 5–21.
- Ehri, L. C., Nunes, S. R., Willows, D. M., Schuster, B. V., Yaghoub-Zadeh, Z., & Shanahan, T. (2001). Phonemic awareness instruction helps children learn to read: Evidence from the National Reading Panel's meta-analysis. *Reading Research Quarterly, 36*(3), 250–287.
- Foorman, B., et al. (2016). *Foundational skills to support reading for understanding in kindergarten through 3rd grade* (NCEE 2016-4008). What Works Clearinghouse, Institute of Education Sciences, U.S. Department of Education.
- Fry, E. (1980). The new instant word list. *The Reading Teacher, 34*(3), 284–289.
- Gough, P. B., & Tunmer, W. E. (1986). Decoding, reading, and reading disability. *Remedial and Special Education, 7*(1), 6–10.
- Graham, S., & Santangelo, T. (2014). Does spelling instruction make students better spellers, readers, and writers? A meta-analytic review. *Reading and Writing, 27*(9), 1703–1743.
- Hattie, J., & Timperley, H. (2007). The power of feedback. *Review of Educational Research, 77*(1), 81–112.
- Hirsh-Pasek, K., Zosh, J. M., Golinkoff, R. M., Gray, J. H., Robb, M. B., & Kaufman, J. (2015). Putting education in "educational" apps: Lessons from the science of learning. *Psychological Science in the Public Interest, 16*(1), 3–34.
- Kim et al. (2023). Differential mastery criteria impact sight word acquisition and maintenance. *Journal of Applied Behavior Analysis* *(verify authors and details).*
- Kim, J., Gilbert, J., Yu, Q., & Gale, C. (2021). Measures matter: A meta-analysis of the effects of educational apps on preschool to grade 3 children's literacy and math skills. *AERA Open, 7.*
- Meyer, M., Zosh, J. M., McLaren, C., Robb, M., McCaffery, H., Golinkoff, R. M., Hirsh-Pasek, K., & Radesky, J. (2021). How educational are "educational" apps for young children? App store content analysis using the Four Pillars of Learning framework. *Journal of Children and Media, 15*(4), 526–548.
- National Reading Panel (2000). *Teaching children to read: An evidence-based assessment of the scientific research literature on reading and its implications for reading instruction.* National Institute of Child Health and Human Development.
- Roediger, H. L., & Karpicke, J. D. (2006). Test-enhanced learning: Taking memory tests improves long-term retention. *Psychological Science, 17*(3), 249–255.
- Scarborough, H. S. (2001). Connecting early language and literacy to later reading (dis)abilities: Evidence, theory, and practice. In S. B. Neuman & D. K. Dickinson (Eds.), *Handbook of early literacy research* (pp. 97–110). Guilford Press.
- Seabrook, R., Brown, G. D. A., & Solity, J. E. (2005). Distributed and massed practice: From laboratory to classroom. *Applied Cognitive Psychology, 19*(1), 107–122.
- Silverman, R. D., et al. (2025). The effects of educational technology interventions on literacy in elementary school: A meta-analysis. *Review of Educational Research, 95*(5), 972–1012.
- Wong et al. (2022). Comparison of mastery criteria applied to individual targets and sets of targets. *Journal of Applied Behavior Analysis* *(verify authors, title and details).*
- Xie, H., Peng, J., Qin, M., Huang, X., Tian, F., & Zhou, Z. (2018). Can touchscreen devices be used to facilitate young children's learning? A meta-analysis of touchscreen learning effect. *Frontiers in Psychology, 9*, 2580.
