import Context from "../../context_detection";
import type {FewShotExample} from "../versions/shared";

/**
 * 中文默认少样本示例。
 *
 * 设计要点：
 * - 请求时只会带上与当前编辑上下文（正文/标题/引用/列表/代码/公式/任务）一致的示例，
 *   所以每个上下文放两条短示例，实际请求通常只用到 2-3 条，token 开销可控。
 * - 每条示例都很短（输入 1-4 行，答案一行），避免移动端请求过长。
 * - 答案只给替换文本本身：v2 之后的提示词只要求输出答案，不再输出 THOUGHT/LANGUAGE。
 * - 注意 zod 校验要求每个答案至少 3 个字符，所以答案不会写成单个汉字。
 */
const examples: FewShotExample[] = [
    // ---------------------------------------------------------------- 正文
    {
        context: Context.Text,
        input: `# 光合作用
光合作用把光能转化为<mask/>，储存到葡萄糖中。`,
        answer: `化学能`,
    },
    {
        context: Context.Text,
        input: `# Git rebase
rebase 会把提交重放到另一个基点上，因此历史保持线性，不会多出一个合并提交。<mask/>`,
        answer: `只在自己独占的分支上使用，不要对已经共享的历史执行 rebase。`,
    },
    {
        context: Context.Text,
        input: `# 采样
温度决定输出的随机程度。取值接近 0 时模型倾向选择概率最高的词，取值越大分布越平坦。<mask/>`,
        answer: `实践中写作类任务取 0.2 到 0.7 比较合适。`,
    },
    {
        context: Context.Text,
        input: `# 幂等
如果一个操作执行两次和执行一次的效果相同，就称这个操作是<mask/>`,
        answer: `幂等的`,
    },
    {
        context: Context.Text,
        input: `# 会议记录
好的笔记是写给未来的自己看的：它记录<mask/>，而不只是最后拍板的结论。`,
        answer: `当时为什么这样决定`,
    },

    // ---------------------------------------------------------------- 标题
    {
        context: Context.Heading,
        input: `# 排查<mask/>泄漏
定位长时间运行的服务里内存持续增长的问题。`,
        answer: `内存泄漏`,
    },
    {
        context: Context.Heading,
        input: `## 第二阶段：<mask/>
把验证过的原型做成可以交付的模块。`,
        answer: `工程实现`,
    },

    // ---------------------------------------------------------------- 引用
    {
        context: Context.BlockQuotes,
        input: `# 注意力机制
论文里把这个想法概括为：
> <mask/>
模型不是把输入压成一个全局摘要，而是让每个词都和其余所有词相互计算权重。`,
        answer: `注意力让模型自己决定该关注输入里的哪一部分。`,
    },
    {
        context: Context.BlockQuotes,
        input: `# 评审清单
评审意见：
> 这里的命名和<mask/>不一致
合并之前请改掉。`,
        answer: `模块其它地方`,
    },

    // -------------------------------------------------------------- 无序列表
    {
        context: Context.UnorderedList,
        input: `# 打包清单
- 护照
- <mask/>
- 充电器
- 耳机`,
        answer: `转换插头`,
    },
    {
        context: Context.UnorderedList,
        input: `# 重试策略
- 最多重试 3 次。
- <mask/>
- 每次重试都记录请求 id。`,
        answer: `每次失败后等待时间翻倍。`,
    },
    {
        context: Context.UnorderedList,
        input: `# 重构待办
- 把解析器拆成独立模块。
- <mask/>
- 删掉已经废弃的配置项。`,
        answer: `给新解析器补上测试。`,
    },

    // -------------------------------------------------------------- 有序列表
    {
        context: Context.NumberedList,
        input: `# 泡茶
1. 把水烧开。
2. <mask/>
3. 焖三分钟。`,
        answer: `把茶叶放进壶里。`,
    },
    {
        context: Context.NumberedList,
        input: `# 发布检查
1. 跑一遍测试。
2. 提升版本号。
3. <mask/>
4. 发布。`,
        answer: `更新更新日志。`,
    },

    // ---------------------------------------------------------------- 代码块
    {
        context: Context.CodeBlock,
        input: `def mean(xs):
    """返回非空列表的算术平均值。"""
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

    // ---------------------------------------------------------------- 公式块
    {
        context: Context.MathBlock,
        input: `圆的面积公式是 $S = <mask/>$。`,
        answer: String.raw`\pi r^2`,
    },
    {
        context: Context.MathBlock,
        input: `因为 $x^2 - 5x + 6 = (x-2)(x-3)$，所以 $x = <mask/>$。`,
        answer: String.raw`2 \text{ 或 } 3`,
    },
    {
        context: Context.MathBlock,
        input: String.raw`对于公比满足 $|r| < 1$ 的等比级数，
$$
\sum_{n=0}^{\infty} a r^n = <mask/>
$$`,
        answer: String.raw`\frac{a}{1-r}`,
    },

    // -------------------------------------------------------------- 任务列表
    {
        context: Context.TaskList,
        input: `# 写博客
- [x] 列提纲
- [ ] <mask/>
- [ ] 发布`,
        answer: `写完初稿`,
    },
    {
        context: Context.TaskList,
        input: `# 缺陷报告
- [x] 收集日志
- [ ] <mask/>
- [ ] 提交 issue`,
        answer: `在本地复现问题`,
    },
];

export default examples;
