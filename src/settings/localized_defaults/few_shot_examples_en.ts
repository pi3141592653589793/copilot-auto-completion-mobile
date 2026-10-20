import Context from "../../context_detection";
import type {FewShotExample} from "../versions/shared";

/**
 * English default few-shot examples.
 *
 * Design notes:
 * - Only the examples whose `context` matches the detected editing context are
 *   sent with a request (see chat_gpt_with_reasoning), so having many short
 *   examples per context is cheap at request time: usually 2-3 are used.
 * - Every example is intentionally short (1-4 lines of input, one line answer)
 *   to keep the prompt compact on mobile.
 * - Answers contain only the replacement text: the v2+ prompt bundle is
 *   "answer only", the THOUGHT/LANGUAGE preamble is not used any more.
 */
const examples: FewShotExample[] = [
    // ---------------------------------------------------------------- Text
    {
        context: Context.Text,
        input: `# Photosynthesis
Photosynthesis converts light energy into <mask/> that is stored in glucose.`,
        answer: `chemical energy`,
    },
    {
        context: Context.Text,
        input: `# Git rebase
Rebasing replays your commits on top of another base, so the history stays linear instead of gaining a merge commit. <mask/>`,
        answer: `Use it only on branches that nobody else has pulled.`,
    },
    {
        context: Context.Text,
        input: `# Sampling
Temperature controls how random the output is. A value near 0 makes the model pick the most likely token, while larger values flatten the distribution. <mask/>`,
        answer: `In practice, 0.2 to 0.7 works well for most writing tasks.`,
    },
    {
        context: Context.Text,
        input: `# Idempotence
An operation is idempotent when running it twice has <mask/>`,
        answer: `the same effect as running it once`,
    },
    {
        context: Context.Text,
        input: `# Meeting notes
A useful note is written for your future self: it records <mask/>, not just the final decision.`,
        answer: `why the decision was made`,
    },

    // ------------------------------------------------------------- Heading
    {
        context: Context.Heading,
        input: `# Fixing a <mask/> leak
How to trace memory that keeps growing in a long-running service.`,
        answer: `memory`,
    },
    {
        context: Context.Heading,
        input: `## Phase 2: <mask/>
Turn the validated prototype into a module that can be shipped.`,
        answer: `Implementation`,
    },

    // ---------------------------------------------------------- BlockQuotes
    {
        context: Context.BlockQuotes,
        input: `# Attention
The paper summarises the idea like this:
> <mask/>
Instead of squeezing the input into one summary, the model weighs every token against every other token.`,
        answer: `Attention lets the model decide which parts of the input matter.`,
    },
    {
        context: Context.BlockQuotes,
        input: `# Review checklist
Reviewer comment:
> The naming here is <mask/>
Rename it before merging.`,
        answer: `inconsistent with the rest of the module`,
    },

    // ------------------------------------------------------- UnorderedList
    {
        context: Context.UnorderedList,
        input: `# Packing list
- Passport
- <mask/>
- Charger
- Headphones`,
        answer: `Travel adapter`,
    },
    {
        context: Context.UnorderedList,
        input: `# Retry policy
- Retries are capped at 3 attempts.
- <mask/>
- Every retry is logged with the request id.`,
        answer: `Backoff doubles after each failure.`,
    },
    {
        context: Context.UnorderedList,
        input: `# Refactoring todo
- Extract the parser into its own module.
- <mask/>
- Remove the deprecated config keys.`,
        answer: `Add tests for the new parser.`,
    },

    // -------------------------------------------------------- NumberedList
    {
        context: Context.NumberedList,
        input: `# Brewing tea
1. Boil the water.
2. <mask/>
3. Steep for three minutes.`,
        answer: `Put the tea leaves in the pot.`,
    },
    {
        context: Context.NumberedList,
        input: `# Release checklist
1. Run the test suite.
2. Bump the version number.
3. <mask/>
4. Publish the release.`,
        answer: `Update the changelog.`,
    },

    // ----------------------------------------------------------- CodeBlock
    {
        context: Context.CodeBlock,
        input: `def mean(xs):
    """Return the arithmetic mean of a non-empty list."""
    <mask/>`,
        answer: `return sum(xs) / len(xs)`,
    },
    {
        context: Context.CodeBlock,
        input: `interface Point {
    x: number;
    <mask/>
}`,
        answer: `y: number;`,
    },
    {
        context: Context.CodeBlock,
        input: `const doubled = items.map((item) => <mask/>);`,
        answer: `item * 2`,
    },

    // ----------------------------------------------------------- MathBlock
    {
        context: Context.MathBlock,
        input: `The area of a circle is $A = <mask/>$.`,
        answer: String.raw`\pi r^2`,
    },
    {
        context: Context.MathBlock,
        input: `Since $x^2 - 5x + 6 = (x-2)(x-3)$, the roots are $x = <mask/>$.`,
        answer: String.raw`2 \text{ or } 3`,
    },
    {
        context: Context.MathBlock,
        input: String.raw`For a geometric series with $|r| < 1$,
$$
\sum_{n=0}^{\infty} a r^n = <mask/>
$$`,
        answer: String.raw`\frac{a}{1-r}`,
    },

    // ------------------------------------------------------------ TaskList
    {
        context: Context.TaskList,
        input: `# Blog post
- [x] Draft the outline
- [ ] <mask/>
- [ ] Publish`,
        answer: `Write the first draft`,
    },
    {
        context: Context.TaskList,
        input: `# Bug report
- [x] Collect the logs
- [ ] <mask/>
- [ ] Open the issue`,
        answer: `Reproduce the bug locally`,
    },
];

export default examples;
