---
layout: post
title: 「学习笔记」分块
date: 2021-10-29
tags: 算法  分块  莫队  暴力
---

分块是一种优化暴力的思想，一般情况下用于查询与修改复杂度差距过大的情况。

分块就是将维护的信息分为许多块，当查询时顺便维护这个块的信息，这样查询时就可以少查询一些内容，优化复杂度，相当于将查询与修改的复杂度均摊了下，这样总复杂度就会降低很多。

以一个简单的例子引入：

> 维护一个数列 $a_i$， 支持以下操作：
> 1. 修改 $a_i$ 为 $v$
> 2. 查询 $\sum_{i=l}^ra_i$

暴力做法显然， 单次修改复杂度 $O(1)$， 单次查询复杂度 $O(n)$。

于是我们可以将数列分为大小为 $T$ 的若干块， 维护每一个块的数字和， 在单点修改时顺便修改所在块的数字和， 然后查询只需要计算 $\displaystyle O(\frac{n}{T})$ 个整块的和和剩下的 $O(T)$ 个数字的和。

这样，我们单次的查询就是 $\displaystyle O(T+\frac{n}{T})$ 的， 此时我们要让这两项尽可能相等，否则两项哪一项较大都可能导致总复杂度过大。

令 $\displaystyle T = \frac{n}{T}$， 得出 $T = \sqrt{n}$， 此时块大小为 $\sqrt{n}$ 是最优的， 单次查询复杂度为 $O(\sqrt{n})$， 总复杂度为 $O(m\sqrt{n})$。

```cpp
int n, a[MAXN], bl[MAXN], siz, sum[MAXN]; 
// bl 代表某一个位置所属的块， siz 表示块的大小
void change(int d, int v) {
    sum[d] += v - a[d];
    a[d] = v;
}
int query(int l, int r) {
    int ans = 0;
    if (bl[l] == bl[r]) {
        for (int i = l; i <= r; i++) ans += a[i];
    } else {
        for (int i = l; bl[i] == bl[l]; i++) ans += a[i];
        for (int i = bl[l] + 1; i <= bl[r] - 1; i++) ans += sum[i];
        for (int i = r; bl[i] == bl[r]; i--) ans += a[i];
    }
    return ans;
}
void pre() {
    siz = sqrt(n);
    for (int i = 1; i <= n; i++) bl[i] = i / siz;
    // x 块的区间范围：[max(1, x * siz), min(n, (x + 1) * siz - 1)]
    // 分块方法有很多，读者可自行选择。
}
```

我们接着来看下面这道题：

> 维护一个数列 $a_i$， 支持以下操作：
> 1. 将 $[l,r]$ 区间内的数字全部加 $v$
> 2. 查询 $\sum_{i=l}^ra_i$

这道题变成了区间修改，不过方法也是类似的。

类似于线段树的延迟标记（懒标签），我们也可以给块使用懒标签。

同样， 对于整块我们直接给整块打一个标记， 并给块的和加上块的大小（注意左右两块的大小）乘加上的数， 而在查询除整块剩余的部分时加上打上的标记就可以了。

这样修改和查询的复杂度就都是 $\displaystyle O(T+\frac{n}{T})$， 与上一题一样， $T=\sqrt{n}$。

```cpp
int n, a[MAXN], bl[MAXN], siz, sum[MAXN], add[MAXN]; 
void change(int l, int r, int v) {
    if (bl[l] == bl[r]) {
        for (int i = l; i <= r; i++) a[i] += v;
    } else {
        for (int i = l; bl[i] == bl[l]; i++) a[i] += v;
        for (int i = bl[l] + 1; i <= bl[r] - 1; i++) {
            add[i] += v;
            sum[i] += (min(n, (i + 1) * siz - 1) - max(1, i * siz) + 1) * v;
        }
        for (int i = r; bl[i] == bl[r]; i--) a[i] += v;
    }
}
int query(int l, int r) {
    int ans = 0;
    if (bl[l] == bl[r]) {
        for (int i = l; i <= r; i++) ans += a[i];
    } else {
        for (int i = l; bl[i] == bl[l]; i++) ans += a[i] + add[bl[i]];
        for (int i = bl[l] + 1; i <= bl[r] - 1; i++) ans += sum[i];
        for (int i = r; bl[i] == bl[r]; i--) ans += a[i] + add[bl[i]];
    }
    return ans;
}
void pre() {
    siz = sqrt(n);
    for (int i = 1; i <= n; i++) bl[i] = i / siz;
}
```

这就是分块的最基本的运用。接下来我们看几个更困难的题目：

> （[传送门](https://www.luogu.com.cn/problem/P2801)）  
> 给定一个数列 $a_i$， 支持以下操作:
> 1. 将 $[l,r]$ 中的数字全部加 $v$
> 2. 求 $[l,r]$ 中有多少个数大于等于 $v$

这道题我们需要查询有多少个数大于等于 $v$。 我们可以先分出块， 求出每一块内大于等于 $v$ 的数量与块外的大于等于 $v$ 的数量相加就是整个区间的数量。

如果每一个块都是有序的， 那么我们直接在块内二分即可 $O(\log T)$ 的求出一个块内大于等于 $v$ 的数量， 总复杂度就是 $\displaystyle O(\frac{n}{T}\log T)$。

那么我们可以每次修改后直接暴力对这个块进行一次排序， 单次修改复杂度就是 $O(T \log T)$。

同样令 $\displaystyle \frac{n}{T}\log T=T \log T$， 可得 $T=\sqrt{n}$， 那么总复杂度就是 $O(\sqrt{n} \log \sqrt{n})$。

```cpp
int n, q, a[MAXN], b[MAXN], l[MAXN], r[MAXN], aa[MAXN], siz, add[MAXN];
int main() {
    scanf("%d%d", &n, &q);
    for (int i = 1; i <= n; i++) scanf("%d", &a[i]);
    memcpy(aa, a, sizeof a);
    siz = sqrt(n);
    for (int i = 1; i <= n; i++) {
        b[i] = i / siz + 1;
    }
    for (int i = 1; i <= n / siz + 1; i++) {
        l[i] = max(1, (i - 1) * siz);
        r[i] = min(n, i * siz - 1);
        sort(aa + l[i], aa + r[i] + 1);
    }
    while (q--) {
        char c[3];
        int x, y, z;
        scanf("%s%d%d%d", c, &x, &y, &z);
        if (c[0] == 'A') {
            int cnt = 0;
            if (b[x] == b[y]) {
                for (int i = x; i <= y; i++) {
                    if (a[i] + add[b[i]] >= z) cnt++;
                }
            } else {
                for (int i = x; i < l[b[x] + 1]; i++) {
                    if (a[i] + add[b[i]] >= z) cnt++;
                }
                for (int i = r[b[y] - 1] + 1; i <= y; i++) {
                    if (a[i] + add[b[i]] >= z) cnt++;
                }
                for (int i = b[x] + 1; i < b[y]; i++) {
                    int *q = lower_bound(aa + l[i], aa + r[i], z - add[i]);
                    if (*q >= z - add[i]) cnt += aa + r[i] - q + 1;
                }
            }
            printf("%d\n", cnt);
        } else {
            if (b[x] == b[y]) {
                for (int i = x; i <= y; i++) a[i] += z;
                for (int i = l[b[x]]; i <= r[b[x]]; i++) aa[i] = a[i];
                sort(aa + l[b[x]], aa + r[b[x]] + 1);
            } else {
                for (int i = x; i <= r[b[x]]; i++) a[i] += z;
                for (int i = l[b[x]]; i <= r[b[x]]; i++) aa[i] = a[i];
                sort(aa + l[b[x]], aa + r[b[x]] + 1);
                for (int i = l[b[y]]; i <= y; i++) a[i] += z;
                for (int i = l[b[y]]; i <= r[b[y]]; i++) aa[i] = a[i];
                sort(aa + l[b[y]], aa + r[b[y]] + 1);
                for (int i = b[x] + 1; i < b[y]; i++) {
                    add[i] += z;
                }
            }
        }
    }
    return 0;
}
```

[蒲公英](https://www.luogu.com.cn/problem/P4168) 这道题是一道很好的分块题，推荐读者自己思考一下。

简单的提示：可以预处理出某个块到某个块的信息， 空间复杂度为 $O(T^2)$， 时间复杂度可以做到 $\displaystyle O(n\cdot \frac{n}{T})$， 查询整块可以降到 $O(1)$。

bzoj 2906: 颜色 这道题需要思考块的大小， 不要直接默认块的大小为 $O(\sqrt{n})$， 先把想法的查询与修改复杂度写出来后再去算块的大小和总复杂度。