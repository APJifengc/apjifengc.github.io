---
layout: post
title: 「解题报告」线段树杂题选做
date: 2022-03-10
tags: 数据结构  线段树
---

发现考试题的线段树都调不明白了，来做点线段树题吧）

# [CF240F TorCoder](https://www.luogu.com.cn/problem/CF240F)

## 题目大意

给定一个仅包含小写字母的字符串 $S$，有 $m$ 次修改，每次修改会将子串 $S[l..r]$ 中的所有字母重排成一个新的字符串，满足新字符串是回文串且字典序最小，如果无法满足就忽略本次修改，求 $m$ 次修改后的字符串。

## 题解

首先我们思考什么时候可以修改，什么时候不能修改。

发现回文串有一个性质：如果回文串长度为奇数，那么肯定有且仅有一个字母出现了奇数次，而如果回文串长度为偶数，肯定不会有字符出现奇数次。

如果满足上面的条件，那么一定能构造出一个回文串。

我们可以先考虑统计每一个字符的数量：发现字符集只有 $26$，所以我们可以直接暴力使用 $26$ 个某种数据结构统计一段区间内有多少个这个字符。

那么统计出来数量之后，如何构造？

我们分别来考虑偶数长度和奇数长度：

偶数长度比较简单，我们需要满足字典序最小，那么我们可以先填前一半，直接从 $a$ 开始填，一直填到 $z$，然后后一半直接对应的填过去，这样就可以满足字典序最小。

奇数长度的话，我们需要记录一下出现了奇数次的那一个字符在哪里。我们首先单独拿出来一个这个字符，放在最中间，然后剩下的还按照偶数长度的进行构造就可以。

发现这样构造正好也会使得同一个字符所在的位置是一个区间，所以我们直接进行区间修改即可。

回顾一下，我们需要一个数据结构，满足：

- 区间求和
- 区间赋值

所以直接线段树维护就可以了。

## 代码

```cpp
#include <bits/stdc++.h>
using namespace std;
const int MAXN = 100005;
int n, m;
struct SegmentTree {
    struct Node {
        int sum, set;
    }t[MAXN << 2];
    #define lc (i << 1)
    #define rc (i << 1 | 1)
    void pushUp(int i) {
        t[i].sum = t[lc].sum + t[rc].sum;
    }
    void pushDown(int i, int l, int r) {
        if (t[i].set != -1) {
            int mid = (l + r) >> 1;
            t[lc].sum = (mid - l + 1) * t[i].set;
            t[rc].sum = (r - mid) * t[i].set;
            t[lc].set = t[i].set;
            t[rc].set = t[i].set;
            t[i].set = -1;
        }
    }
    void build(int i = 1, int l = 1, int r = n) {
        if (l == r) {
            t[i].set = -1;
            return;
        }
        int mid = (l + r) >> 1;
        build(lc, l, mid);
        build(rc, mid + 1, r);
        t[i].set = -1;
    }
    void set(int a, int b, int v, int i = 1, int l = 1, int r = n) {
        if (l > r) return;
        if (a <= l && r <= b) {
            t[i].set = v;
            t[i].sum = (r - l + 1) * v;
            return;
        }
        pushDown(i, l, r);
        int mid = (l + r) >> 1;
        if (a <= mid) set(a, b, v, lc, l, mid);
        if (b > mid) set(a, b, v, rc, mid + 1, r);
        pushUp(i);
    }
    int query(int a, int b, int i = 1, int l = 1, int r = n) {
        if (a <= l && r <= b) {
            return t[i].sum;
        }
        pushDown(i, l, r);
        int mid = (l + r) >> 1;
        int ans = 0;
        if (a <= mid) ans += query(a, b, lc, l, mid);
        if (b > mid) ans += query(a, b, rc, mid + 1, r);
        return ans;
    }
}st[26];
char ch[MAXN];
int cnt[26];
int main() {
    scanf("%d%d%s", &n, &m, ch + 1);
    for (int i = 0; i < 26; i++) st[i].build();
    for (int i = 1; i <= n; i++) {
        st[ch[i] - 'a'].set(i, i, 1);
    }
    while (m--) {
        int l, r; scanf("%d%d", &l, &r);
        for (int i = 0; i < 26; i++) cnt[i] = st[i].query(l, r);
        int odd = -1;
        bool flag = false;
        for (int i = 0; i < 26; i++) {
            if (cnt[i] & 1) { // 出现奇数次
                if ((r - l + 1) & 1) { // 奇数回文串
                    if (odd != -1) { // 存在两个出现奇数次的字符，无解
                        flag = true;
                        break;
                    } else {
                        odd = i;
                    }
                } else { // 偶数回文串，无解
                    flag = true;
                    break;
                }
            }
        }
        if (flag) continue;
        int cc = 0;
        if (odd != -1) {
            st[odd].set(l, r, 0);
            int mid = (l + r) >> 1;
            st[odd].set(mid, mid, 1);
        }
        for (int i = 0; i < 26; i++) {
            cnt[i] /= 2;
            if (cnt[i] == 0) continue;
            if (i != odd) st[i].set(l, r, 0);
            st[i].set(l + cc, l + cc + cnt[i] - 1, 1);
            st[i].set(r - cc - cnt[i] + 1, r - cc, 1);
            cc += cnt[i];
        }
    }
    for (int i = 1; i <= n; i++) {
        for (int j = 0; j < 26; j++) {
            if (st[j].query(i, i) == 1) {
                printf("%c", 'a' + j);
                break;
            }
        }
    }
    return 0;
}
```

# [CF242E XOR on Segment](https://www.luogu.com.cn/problem/CF242E)

## 题目大意

给定一个数列 $a_i$，要求支持以下操作：

1. 求 $\sum_{i=l}^ra_i$。
2. 给 $[l,r]$ 区间里的所有数异或一个 $x$。

发现异或对于每一位的贡献都是互相独立的，所以我们直接按照二进制拆分成若干个数，然后问题就变为了：对一个区间力的所有数进行翻转，很容易可以使用线段树维护。

~~反正洛谷题解交不了那就少说点吧~~

```cpp
#include <bits/stdc++.h>
using namespace std;
const int MAXN = 100005;
int n, m, a[MAXN];
struct SegmentTree {
    struct Node {
        int sum;
        bool flip;
    }t[MAXN << 2];
    #define lc (i << 1)
    #define rc (i << 1 | 1)
    void pushUp(int i) {
        t[i].sum = t[lc].sum + t[rc].sum;
    }
    void pushDown(int i, int l, int r) {
        if (t[i].flip) {
            int mid = (l + r) >> 1;
            t[lc].flip ^= 1;
            t[rc].flip ^= 1;
            t[lc].sum = (mid - l + 1) - t[lc].sum;
            t[rc].sum = (r - mid) - t[rc].sum;
            t[i].flip = 0;
        }
    }
    void flip(int a, int b, int i = 1, int l = 1, int r = n) {
        if (a <= l && r <= b) {
            t[i].flip ^= 1;
            t[i].sum = (r - l + 1) - t[i].sum;
            return;
        }
        pushDown(i, l, r);
        int mid = (l + r) >> 1;
        if (a <= mid) flip(a, b, lc, l, mid);
        if (b > mid) flip(a, b, rc, mid + 1, r);
        pushUp(i);
    }
    int query(int a, int b, int i = 1, int l = 1, int r = n) {
        if (a <= l && r <= b) {
            return t[i].sum;
        }
        pushDown(i, l, r);
        int mid = (l + r) >> 1;
        int ans = 0;
        if (a <= mid) ans += query(a, b, lc, l, mid);
        if (b > mid) ans += query(a, b, rc, mid + 1, r);
        return ans;
    }
} st[21];
int main() {
    scanf("%d", &n);
    for (int i = 1; i <= n; i++) scanf("%d", &a[i]);
    for (int i = 1; i <= n; i++) {
        for (int j = 0; j <= 20; j++) if (a[i] >> j & 1) {
            st[j].flip(i, i);
        }
    }
    scanf("%d", &m);
    while (m--) {
        int op; scanf("%d", &op);
        if (op == 1) {
            int l, r; scanf("%d%d", &l, &r);
            long long ans = 0;
            for (long long i = 0; i <= 20; i++) {
                ans += ((long long) st[i].query(l, r)) << i;
            }
            printf("%lld\n", ans);
        } else {
            int l, r, x; scanf("%d%d%d", &l, &r, &x);
            for (int i = 0; i <= 20; i++) if (x >> i & 1) {
                st[i].flip(l, r);
            }
        }
    }
    return 0;
}
```

~~不是这些题怎么都这么水~~

~~挑题中，实在懒得做了~~