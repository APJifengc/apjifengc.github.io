---
layout: post
title: 「学习笔记」数 学 杂 论
date: 2022-02-20
tags: 数学  卡特兰数  Prufer  BSGS  杜教筛  拉格郞日插值  群论  线性基  斯特林数  二项式反演  Min-Max容斥  原根
---

数学这东西再不记下大概真的会死的吧..

## 卡特兰数

定义卡特兰数：$H_n=\frac{\binom{2n}{n}}{n+1}$。

1. 路径计数
2. 凸多边形划分为三角形方法数
3. 栈的进栈入栈序列数
4. $n$ 个节点可以构造的二叉树的个数

数列： $1,1,2,5,14,42,132,\cdots$

常用公式：

$$H_n=\frac{\binom{2n}{n}}{n+1}$$

$$H_n=\frac{H_{n-1}(4n-2)}{n+1}$$

$$H_n=\binom{2n}{n}-\binom{2n}{n-1}$$

$$H_n = \begin{cases} \sum_{i=1}^{n} H_{i-1} H_{n-i} & n \geq 2, n \in \mathbf{N_{+}}\\ 1 & n = 0, 1 \end{cases} $$

## Prufer 序列

Prufer 序列是一种将无根树**映射**到一个序列上，且每种序列都唯一对应一种无根树。

具体构造如下：

1. 找出所有叶子节点中编号最小的一个。
2. 删除这个叶子节点，并且将这个叶子节点的父节点（所连向的节点）加入数列。
3. 持续步骤 1、2，直到节点个数为 2。

也就是说，$n$ 个节点的 Prufer 序列的长度为 $n - 2$。

为什么这样是一一对应的呢？因为这样相当与每一次将一个当前所能加入的最小的节点连接到某个节点下，这 $n - 2$ 个数字可以看作是 $n - 2$ 次连边，最一开始有两个节点，他们首先连边，这样就是 $n - 1$ 条边。

性质：

- 某个点的度数等于它在 Prufer 序列中出现的次数 + 1
  为什么呢？可以思考，每一个数相当于是有一个点向这个数连了一次边，而这个点最开始已经向一个节点连过了边，所以是次数 + 1。
- $n$ 个点的无根树最多有 $n^{n-2}$ 种。
  因为一种无根树唯一对应一种 Puffer 序列，而 Puffer 序列的长度为 $n - 2$，每个数都有 $n$ 种取值，所以是 $n^{n-2}$ 种。

## BSGS

BSGS，全名 Baby-Step-Giant-Step，是一种求解高次同余方程的算法。

具体地，它可以用来求形如 $a^x\equiv b\pmod P$ （$P$ 为质数）的解。

BSGS 的做法是将 $a^x$ 拆为 $a^{pt-q}$，其中 $t=\lfloor\sqrt P\rfloor,q < t$。

即：

$$\begin{aligned}
a^{pt-q}&\equiv b&\pmod P\\
(a^t)^p&\equiv ba^q&\pmod P
\end{aligned}$$

我们可以把所有可能的 $ba^q$ 全部插入到哈系表中，然后枚举 $p$，看 $(a^t)^p$ 是否在哈系表中即可。

注意题面数据范围，看是否需要特判特殊情况（$a=0$ 时，若 $b=0$，则 $x=1$，否则无解）。

代码：

```cpp
int BSGS(int a, int b, int p) {
    unordered_map<int, int> s;
    int sqr = sqrt(p) + 1;
    int po = qpow(a, sqr);
    int q = 1, w = 1;
    for (int i = 0; i < sqr; i++) s[b * q] = i, q = 1ll * q * a % p;
    for (int i = 1; i <= sqr; i++) {
        w = 1ll * w * po % p;
        int ans; if (s.count(w) && (ans = sqr * i - s[w]) >= 0) {
            return ans;
        }
    }
    return -1;
}
```

## 杜教筛

这东西其实之前学过，再回忆一遍吧。

杜教筛可以用来在 $O(n^\frac{2}{3})$ 的复杂度内求一些数论函数的前缀和。

主要思想是：寻找另一个数论函数，将要求的数论函数与这个数论函数进行卷积，得到一个比较好求的数论函数。

比如，$\varphi * \mathrm I = \mathrm {Id}$， $\mu * \mathrm I = \epsilon$。

设我们要求的函数为 $f(x)$，它的前缀和为 $s(x)$，我们现在找到了一个函数 $g(x)$，使 $h = f * g$，我们对 $h(x)$ 这个函数求前缀和：

$$\begin{aligned}
\sum_{i=1}^nh(x)&=\sum_{i=1}^n\sum_{j\mid i}f(\frac{i}{j})g(j)\\
&=\sum_{j=1}^n\sum_{i=1}^{\lfloor\frac{n}{j}\rfloor}f(i)g(j)\\
&=\sum_{j=1}^ng(j)\sum_{i=1}^{\lfloor\frac{n}{j}\rfloor}f(i)\\
&=\sum_{j=1}^ng(j)s(\lfloor\frac{n}{j}\rfloor)\\
\end{aligned}$$

然后我们把这个式子变换一下：

$$\begin{aligned}
\sum_{j=1}^ng(j)s(\lfloor\frac{n}{j}\rfloor)&=\sum_{i=1}^nh(x)\\
g(1)s(n) + \sum_{j=2}^ng(j)s(\lfloor\frac{n}{j}\rfloor)&=\sum_{i=1}^nh(x)\\
g(1)s(n) &= \sum_{i=1}^nh(x) - \sum_{j=2}^ng(j)s(\lfloor\frac{n}{j}\rfloor)\\
s( n) &= \frac{\sum_{i=1}^nh(x) - \sum_{j=2}^ng(j)s(\lfloor\frac{n}{j}\rfloor)}{g(1)}\\
\end{aligned}$$

这样我们就可以用数论分块递归求解了，复杂度为 $O(n^\frac{3}{4})$。

我们可以先预处理出前 $O(n^\frac{2}{3})$ 个 $f(x)$ 的前缀和，这样总复杂度就是 $O(n^\frac{2}{3})$。

常见的函数：

### $\varphi(x)$

$$\begin{aligned}
s(n) &= \frac{\sum_{i=1}^nx - \sum_{j=2}^ns(\lfloor\frac{n}{j}\rfloor)}{1}\\
&= \frac{n(n+1)}{2} - \sum_{j=2}^ns(\lfloor\frac{n}{j}\rfloor)\\
\end{aligned}$$

### $\mu(x)$

$$\begin{aligned}
s(n) &= \frac{\sum_{i=1}^n[i=1] - \sum_{j=2}^ns(\lfloor\frac{n}{j}\rfloor)}{1}\\
&= 1 - \sum_{j=2}^ns(\lfloor\frac{n}{j}\rfloor)\\
\end{aligned}$$

### 练习

~~实际上就是防止自己完全忘了怎么做~~

求 $f(x)=x\varphi(x)$ 的前缀和。

$$\require{color}\colorbox{black}{$\color{black}f * \mathrm{Id} = \mathrm{Id}^2$}$$

$$\require{color}\colorbox{black}{$\color{black}s(n) = \frac{x(x+1)(2x+1)}{6} - \sum_{j=2}^nj\times s(\lfloor\frac{n}{j}\rfloor)$}$$

~~接下来开始都是比较痛苦的东西了~~

## 群论

复习自用，~~推荐不要看，非常不严谨~~

%%% [command_block](https://www.luogu.com.cn/blog/command-block/qun-lun-xiao-ji)

### 什么是群？



~~[https://www.baidu.com/s?w=什么是群论](https://www.baidu.com/s?w=%E4%BB%80%E4%B9%88%E6%98%AF%E7%BE%A4%E8%AE%BA)~~

**群**，由集合与两元运算符定义，记为 $\mathbb G=(G,\cdot)$。

它满足以下性质：

1. **封闭性**：对于所有 $G$ 中 $a, b$，运算 $a·b$ 的结果也在 G 中。
2. **结合律**(Associativity)：对于 $G$ 中所有的 $a, b, c$，等式 $(a \cdot b)\cdot c = a \cdot (b \cdot c)$ 成立。
3. **标识元**（Identity element，也称单位元）：$G$ 中存在一个元素 $e$，使得对于 $G$ 中的每一个 $a$，都有一个 $e \cdot a=a\cdot e=a$ 成立。这样的元素是独一无二的。它被称为群的标识元素。
4. **逆元**(Inverse element)：对于每个 $G$ 中的 $a$，总存在 $G$ 中的一个元素 $b$ 使 $a \cdot b = b \cdot a = e$，此处 $e$ 为单位元，称 $b$ 为 $a$ 的逆元，记为 $a^{-1}$。

~~全是抄来的~~

### 什么是置换群？

置换的群。

~~我现在写博客越来越随意了~~

### 置换的标记

一般有两种：

1. $$\begin{pmatrix}1&2&3&4\\2&4&3&1\end{pmatrix}$$

2. $$(1,2,4)(3)$$

### 不动点

对于 $p\in G$，若 $k\xrightarrow{p}k$，则称 $k$ 是 $p$ 下的不动点。

将 $p$ 下的不动点个数即为 $c(p)$。

例如，

$$\begin{pmatrix}1&2&3&4\\2&4&3&1\end{pmatrix}$$ 

的不动点数为 $1$。

### 等价类

等价类为通过群中的每一个置换能够变成的所有元素，记为 $\mathbb E_x$。

例如，$\mathbb G = \{e, (1,2,4), (3), (1,2,4)(3)\}$，那么 $3$ 的等价类就是 $\{1,2,4\}$

### $k$ 不动点置换类

群中所有的能够使 $k$ 的位置不动的置换的子集，记做 $\mathbb Z_k$。

可以发现，置换类是原群的一个**子群**。

### 轨道-稳定化子定理

$$\vert\mathbb Z_k\vert\times \vert\mathbb E_k\vert = \vert\mathbb G\vert$$

### Burnside 引理

一个群的等价类个数为：

$$\frac{1}{\vert\mathbb G\vert}\sum_{p\in \mathbb G}c(p)$$

### Polya 定理

对于染色问题来说，这个定理更加常用。

设 $T(p)$ 为 $p$ 置换下染色方案不变化的方案数，$\mathbb G$ 为所有元素的置换群，那么本质不同的染色方案为：

$$\frac{1}{\vert\mathbb G\vert}\sum_{p\in \mathbb G}T(p)$$

这个证明还是要理解的，因为有些题的方法类似。

我们可以把所有的染色方案看作一个置换群 $\mathbb G_2$，而把原来的元素看作一个置换群 $\mathbb G_1$，那么对于每一种位置变化的情况，染色方案也发生了相对应的变化，所以这两个群的大小是相等的。即 $\vert\mathbb G_1\vert=\vert\mathbb G_2\vert$。那么根据 Burnside 引理，就能得到上式。

比如：将一个长度为 $6$ 的绳子染色，每段可以染 $4$ 种颜色，翻转后颜色相同算同一种方案，求总方案数。

对于翻转，此时的置换群就是：

$$\left\{\begin{pmatrix}1&2&3&4&5&6\\1&2&3&4&5&6\end{pmatrix},\begin{pmatrix}1&2&3&4&5&6\\6&5&4&3&2&1\end{pmatrix}\right\}$$

（不要忘记最开始的单位元置换，也就是对应着不翻转。）

如何计算置换后染色方案不变化的方案数？可以发现，一个等价类内的所有元素必须染相同的颜色，那么染色方案不变的方案数就是 $m^c$ （$m$ 为颜色数，$c$ 为等价类数量）。

我们可以把置换群写作：

$$\left\{(1)(2)(3)(4)(5)(6), (1,6)(2,5)(3,4)\right\}$$

那么答案就是：$\frac{4^6+4^3}{2}=2080$。

置换群在 OI 中的应用多是解决本质不同的计数问题，通常会与数论、DP 等知识点共同考察。

## 线性基

线性基是一种维护**异或**信息的高效数据结构，它可以做以下事情：

1. 维护一个集合的最大/最小异或和。
2. 查询是否存在某个异或和。
3. 查询某个异或和的排名/查询第 $k$ 大的异或和。

它有以下几个性质：

1. 线性基中的所有异或和与原集合的所有异或和相等。
2. 满足 1. 且集合大小最小。
3. 最高位各不相同。

直接来看如何构建就好：

```cpp
struct LinearBasis {
    int a[B + 1];
    bool zero;
    void insert(int x) {
        for (int i = B; i >= 0; i--) if (x & (1 << i)) {
            if (!a[i]) {
                a[i] = x;
                return;
            }
            x ^= a[i];
        }
        zero = 1;
    }
}lb;
```

我们用 $a_i$ 来代表**最高位为 $i$ 的数**，算法流程就是这样的：

1. 首先将插入的数从高位往低位枚举；
2. 如果线性基中没有以插入的数的这一位为最高位的数字，那么就将最高位为这一位的数字设置为它；否则，就将现在的数字异或上最高位为这一位的数字，再继续向低位枚举。

为什么这么存呢？如果我们把每一个最高位的数字都存储下来，那么我们就可以表示任意一个可以异或出来的数字了。因为对于这一位，如果现在为 $o$，你想让它变成 $1$，那么你就直接异或上最高位为这一位的数字，就可以把最高位设置为 $1$ 了，这样就压缩了信息。

需要注意的是，如果最后都没有插入的数字，那么说明现在的线性基已经可以表示出这个数字，那么将表示出来的数字异或上它自己就是 $0$。所以，我们需要特别记录一下异或和此时存在 $0$。

### 查询最大值

我们可以考虑贪心。因为最高位是 $1$ 一定比最高位是 $0$ 要优，所以我们从高位到低位考虑，如果异或上这个数会使答案变大，就异或上。

```cpp
int qmax() {
    int ans = 0;
    for (int i = B; i >= 0; i--)
        if ((ans ^ a[i]) > ans) ans ^= a[i];
    return ans;
}
```

### 查询最小值

其实最小值就是线性基中的最小值。但是不要忘记 $0$。

```cpp
int qmin() {
    if (zero) return 0;
    for (int i = 0; i <= B; i++) if (a[i]) return a[i];
}
```

### 查询是否存在

和插入是类似的，从高位到低位异或，如果最后能异或出来 $0$ 就是存在。

```cpp
bool contains(int x) {
    for (int i = B; i >= 0; i--) if (x & (1 << i)) x ^= a[i];
    return x == 0;
}
```

### 查询第 $k$ 小

此时我们要对线性基进行重构。

为什么？因为现在线性基中的所有数都是可以互相影响的，无法直接判断大小，我们需要让它们互不影响。

我们可以考虑从小往大枚举，每次把低于这一位的全部消去，尽量只留下最高位。

可是有时候不可能只留下最高位怎么办？但是没关系，因为对于之前有数的那几位，消完之后就已经互不影响了，多出的这几位不会影响大小。

我们把现在还有数的这几位存下来。

```cpp
void rebuild() {
    for (int i = 1; i <= B; i++)
        for (int j = i - 1; j >= 0; j--) 
            if (a[i] & (1 << j)) a[i] ^= a[j];
    for (int i = 0; i <= B; i++) if (a[i]) b[++cnt] = a[i];
}
```

然后如何查询第 $k$ 小？现在每一位已经互不影响了，所以你可以把它直接看作一个二进制数，$k$ 的二进制表示的数异或起来就是第 $k$ 小的。

并且不要忘记 $0$。

```cpp
int kth(int k) {
    int ans = 0;
    for (int i = 1; i <= cnt; i++) 
        if (k & (1 << (i - 1))) ans ^= b[i];
    return ans;
}
```

### 查排名

其实理解了第 $k$ 小这个就好理解了。

不过有一点要注意的，就是需要记录 $0$ 的个数。因为如果有一个 $0$，那么之前能组合出来的数就会都再次翻一次倍。因为 $0$ 跟任何一个数异或都不变。

```cpp
int rank(int x) {
    int ans = 0;
    for (int i = cnt; i >= 1; i--)
        if (x >= b[i]) ans += (1 << (i - 1)), x ^= b[i];
    return qpow(2, zero) * ans + 1;
}
```

## 拉格朗日插值

**Lagrange** 插值是一种用 $n+1$ 个点求 $n$ 次多项式的方法。

假设我们有 $0\sim n$ 个点 $(x_i,y_i)$，考虑构造这样一个多项式：

$$f_i=\prod_{i\ne j}\frac{x-x_j}{x_i-x_j}$$

我们发现，当 $x=x_i$ 时，分子分母相等，结果为 $1$；否则，分子中有一项为 $0$，整体为 $0$。

那么，我们就可以构造出整个多项式了：

$$\begin{aligned}
F&=\sum_{i=0}^ny_if_i\\
&=\sum_{i=0}^ny_i\prod_{i\ne j}\frac{x-x_j}{x_i-x_j}
\end{aligned}$$

发现，这样就使原来的 $n + 1$ 个点全部都在多项式上，且构造出了一个 $n$ 次多项式。

代码：

```cpp
struct Polynomial {
    int a[MAXD];
    Polynomial() { memset(a, 0, sizeof a); }
    Polynomial(int k, int b) { 
        memset(a, 0, sizeof a);
        a[1] = k, a[0] = b;
    }
    int& operator[](int b) { return a[b]; }
    Polynomial operator*(Polynomial b) {
        Polynomial c;
        for (int i = 0; i < MAXD; i++) {
            for (int j = 0; j < MAXD - i; j++) {
                c[i + j] = (c[i + j] + 1ll * a[i] * b[j] % P) % P;
            }
        }
        return c;
    }
    Polynomial operator*(int b) {
        Polynomial c = *this;
        for (int i = 0; i < MAXD; i++) c[i] = 1ll * c[i] * b % P;
        return c;
    }
    Polynomial operator/(int b) {
        Polynomial c = *this;
        int d = qpow(b, P - 2);
        for (int i = 0; i < MAXD; i++) c[i] = 1ll * c[i] * d % P;
        return c;
    }
    Polynomial operator+(Polynomial b) {
        Polynomial c;
        for (int i = 0; i < MAXD; i++) c[i] = (a[i] + b[i]) % P;
        return c;
    }
};
int x[MAXD], y[MAXD];
Polynomial lagrange() {
    Polynomial ans;
    for (int i = 0; i <= d + 1; i++) {
        Polynomial s1(0, 1);
        int s2 = 1;
        for (int j = 0; j <= d + 1; j++) if (i != j) {
            s1 = s1 * Polynomial(1, P - x[j]);
            s2 = 1ll * s2 * qpow((P + x[i] - x[j]) % P, P - 2) % P;
        }
        ans = ans + s1 * s2 * y[i];
    }
    return ans;
}
```

如果仅求一个值，可以直接将 $x$ 带入，就不用再求整个多项式了。

### 取值连续

大多数情况下，当 $x$ 值取值连续时，可以优化至 $O(n)$。

因为当取值连续时（假设为 $0\sim n$），发现每次分子分母只会变换两个值。

例如，取 $n=3$，得到下面：

| $\frac{\qquad(x-1)(x-2)(x-3)}{\qquad(0-1)(0-2)(0-3)}$ |
| :---------------------------------------------------: |
| $\frac{(x-0)\qquad(x-2)(x-3)}{(1-0)\qquad(1-2)(1-3)}$ |
| $\frac{(x-0)(x-1)\qquad(x-3)}{(2-0)(2-1)\qquad(2-3)}$ |
| $\frac{(x-0)(x-1)(x-2)\qquad}{(3-0)(3-1)(3-2)\qquad}$ |

分子显然每次乘 $x-i$ 再除以 $x-i-1$，分母不太显然，但是可以变换一下：

| $\frac{\qquad(x-1)(x-2)(x-3)}{\qquad(0-1)(0-2)(0-3)}$ |
| :---------------------------------------------------: |
| $\frac{(x-0)\qquad(x-2)(x-3)}{(1-0)\qquad(0-1)(0-2)}$ |
| $\frac{(x-0)(x-1)\qquad(x-3)}{(2-0)(1-0)\qquad(0-1)}$ |
| $\frac{(x-0)(x-1)(x-2)\qquad}{(3-0)(2-0)(1-0)\qquad}$ |

发现，每次除以了 $n-i$ 并乘上了 $i + 1$。

所以，就可以 $O(n)$ 算出某一项的值了。

```cpp
int lagrange(long long x, int d) {
    if (x <= d) return y[x];
    int tmp = 1, ans = 0;
    for (int i = 1; i <= d; i++) tmp = 1ll * tmp * (P + x % P - i) % P;
    for (int i = 1; i <= d; i++) tmp = 1ll * tmp * qpow(i, P - 2) % P;
    for (int i = 0, o = (d % 2 == 0 ? 1 : -1); i <= d; i++, o = P - o) {
        ans = (ans + 1ll * o * tmp % P * y[i] % P) % P;
        tmp = 1ll * tmp * (x % P - i) % P * qpow(x % P - i - 1, P - 2) % P;
        tmp = 1ll * tmp * (d - i) % P * qpow(i + 1, P - 2) % P;
    }
    return (ans + P) % P;
}
```

## 原根

### 阶

使 $a^x\equiv 1\pmod n$ 成立的最小正整数 $x$ 值，称为 $a$ 模 $n$ 意义下的阶，记做 $\operatorname{ord}_an$。

性质：$\forall x\in[1,\operatorname{ord}_an]$，$a^x \bmod n$ 互不相等。

### 原根

定义：若 $\operatorname{ord}_an=\varphi(n)$，那么称 $a$ 为 $n$ 的一个原根。

显然的性质：$\forall x\in[1,\varphi(n)]$，$a^x \bmod n$ 互不相等。

于是这实际上就是一种从指数到底数的双射。

### 原根存在定理

仅有 $2,4,p^k,2p^k$ （$p$ 为奇质数）存在原根。

### 原根判定定理

若对于 $\varphi(n)$ 的每一个质因子 $p$，都有 $a^{\frac{\varphi(n)}{p}}\not\equiv1$，那么 $a$ 就是原根。

若存在原根，那么最小的原根大小是 $O(n^{0.25})$ 级别的，所以可以暴力寻找一个最小原根。

### 所有原根

若最小原根为 $g$，那么所有原根为 $g^i,\gcd(i,\varphi(n))=1$。

可以发现，一个数的原根数量为 $\varphi(\varphi(n))$

### 高次剩余

求解：$x^a\equiv b\pmod p$，$p$ 为质数。

首先求出 $p$ 的一个原根 $g$。

那么一定存在一个 $c$，使得 $x\equiv g^c\pmod P$。

那么就是 $(g^c)^a\equiv b\pmod P$，即 $(g^a)^c\equiv b\pmod P$。

这样方程就化为了 $a^x\equiv b\pmod p$ 的形式。于是我们就可以用 BSGS 求出 $c$，然后原方程的解就是 $g^c$。

方程的通解为：$g^{c+i\times \frac{\varphi(n)}{\gcd(a,\varphi(n))}}$。

## 二项式反演

有以下公式：

$$f(x)=\sum_{i=m}^x\binom{x}{i}g(i)\Leftrightarrow g(x)=\sum_{i=m}^x(-1)^{x-i}\binom{x}{i}f(i)$$

$$f(x)=\sum_{i=x}^n\binom{i}{x}g(i)\Leftrightarrow g(x)=\sum_{i=x}^n(-1)^{i-x}\binom{i}{x}f(i)$$

它一般用来解决**恰好**类型的计数题目。

一般的，我们设 $f(x)$ 为至少有 $x$ 个的方案数，$g(x)$ 为恰好有 $x$ 个的方案数，那么不难得出：

$$f(x)=\sum_{i=x}^n\binom{i}{x}g(i)$$

（即：枚举恰好 $i$ 个，那么恰好 $i$ 个中选出 $x$ 个的方案数就是 $\binom{i}{x}$，然后再乘恰好 $i$ 个的方案数。）

大多数情况下，我们发现 $f(x)$ 很好求，但是 $g(x)$ 不好求。这时候，我们就可以利用二项式反演，变为下面的形式：

$$g(x)=\sum_{i=x}^n(-1)^{i-x}\binom{i}{x}f(i)$$

这样，就可以通过计算至少 $x$ 个的方案数来算出恰好 $x$ 个的方案数。

至多也是同样的道理。

## 斯特林数

~~花时间把具体数学上的东西抄下来了~~

### 第二类斯特林数

**第二类斯特林数**是指将 $n$ 个物品划分到 $k$ 个非空子集中的方案数。记做 $\displaystyle {n \brace k}$，读作 “$n$ 划分 $k$”。

1. $${n \brace 0}=\begin{cases}1&(n=0)\\0&(n>0)\end{cases}$$
2. $${n \brace 1}=1$$
3. $${n \brace 2}=2^{n - 1} - 1$$
   可以将第一个元素放到第一个子集内，然后将剩下的随便放。这样有可能第二个子集为空，所以要减 $1$。
4. $${n \brace k} = k {n - 1 \brace k} + {n - 1 \brace k - 1}$$
   考虑第 $n$ 个元素：
   - 若放在单独的一个集合中，那么方案数为 $\displaystyle{n - 1 \brace k - 1}$。
   - 若放在已有的 $k$ 个集合中，有 $k$ 种选择，总方案数为 $\displaystyle k {n - 1 \brace k}$。
5. $${n \brace k} = \sum_{i=0}^k\frac{(-1)^{k-i}i^n}{i!(k-i)!}$$

### 第一类斯特林数

**第一类斯特林数**是指将 $n$ 个物品划分到 $k$ 个轮换中的方案数。一个轮换就是一个首位相连的环。

它记做 $\displaystyle{n \brack k}$，读作 “$n$ 划分 $k$”。

1. $${n \brack 1}=(n-1)!$$
   考虑将第一个固定住，那么剩下的随便排列，就有 $(n-1)!$ 种方案。
2. $${n\brack k} = (n - 1){n - 1 \brack k} + {n - 1 \brack k - 1}$$
   同样考虑第 $n$ 个元素：
   - 若单独成轮换，那么就有 $\displaystyle{n - 1 \brack k - 1}$ 种方案。
   - 若放到前面的轮换中，那么每一个长度为 $a$ 的轮换都有 $a$ 种放置位置，放置方案数就是 $(n-1)$，总方案数就是 $\displaystyle(n - 1){n - 1 \brack k}$。
3. $$\sum_{i=0}^n{n \brack i}=n!$$
   实际上，每一种轮换划分方案就是对应着一种置换，所以所有方案加起来就是总置换数，即 $n!$。

### 第一类斯特林数与第二类斯特林数的关系

$${n \brack k} \ge {n \brace k}$$
特别的，

- $${n \brack n} = {n \brace n} = 1$$
- $${n \brack n - 1} = {n \brace n - 1} = \binom{n}{2}$$

### 上升幂、下降幂与普通幂的关系

$$x^{k} = \sum_{i=0}^k {k \brace i} x^{\underline i}$$

（相当于 $\displaystyle x^{k} = \sum_{i=0}^k {k \brace i} \binom{x}{i} i!$，这提供了一种将幂转换为组合数的方法，因为组合数加法公式的存在，组合数要比幂更好维护。）

$$x^{\overline k} = \sum_{i=0}^k {k \brack i} x^i$$

### 斯特林反演

$$f(x)=\sum_{i=0}^x {x \brace i}g(i) \Leftrightarrow g(x) = \sum_{i=0}^k (-1)^{k-i} {x \brack i}f(i)$$

$$f(x)=\sum_{i=0}^x {x \brack i}g(i) \Leftrightarrow g(x) = \sum_{i=0}^k (-1)^{k-i} {x \brace i}f(i)$$

一般用于求子集划分相关的计数问题：设 $f(x)$ 为划分至少/至多 $x$ 个子集的方案数，$g(x)$ 为恰好 $x$ 个子集的方案数，于是就可以用斯特林反演求出 $g(x)$。

也可以由此推出普通幂转上升幂、下降幂转普通幂的公式，不过 OI 中用的最多的应该只有普通幂转下降幂。

## Min-Max 容斥

设 $S$ 为一个集合，$\max_{x\in S} x$ 为集合中的最大值，$\min_{x\in S} x$ 为集合中的最小值，那么就有以下：

$$\max_{i\in S}{x_i}=\sum_{T\subseteq S}{(-1)^{|T|-1}\min_{j\in T}{x_j}}$$

$$\min_{i\in S}{x_i}=\sum_{T\subseteq S}{(-1)^{|T|-1}\max_{j\in T}{x_j}}$$

- 可以用于期望，例如 [[PKUWC2018]随机游走](https://www.luogu.com.cn/problem/P5643)。经过所有点的期望时间就相当于第一次经过所有点的最大时间的期望值，那么就可以用 Min-Max 容斥改为求经过所有点的最小时间的期望值，也就是第一次碰到一个点的时间期望值。
- $\operatorname{lcm}$ 可以看作是对质因子分解后指数取 $\max$，那么 $\gcd$ 就是取 $\min$，因此也可以用 Min-Max 容斥进行计算。
  具体的，
  $$\underset{i\in S}{\operatorname{lcm}}{x_i}=\prod_{T\subseteq S}{\left(\gcd_{j\in T}{x_j} \right)^{(-1)^{|T|-1}}}$$
- 拓展：第 $k$ 大：
  $$\underset{i\in S}{\operatorname{kthmax}{x_i}}=\sum_{T\subseteq S}{(-1)^{|T|-k}\binom {|T|-1}{|T|-k}\min_{j\in T}{x_j}}$$
  反过来相同，并且也可以用于期望。