---
layout: post
title: 「学习笔记」DAG 计数（P6295, CF1466H)
date: 2022-09-08
tags: 算法  学习笔记  数学  计数
---

考虑一个计数问题：

求有 $n$ 个点的有向无环图（即 DAG）的数量。

首先考虑朴素 DP：设 $f_i$ 为 $i$ 个点的 DAG 数量。

我们考虑按照拓扑序来计算这个东西，即每次删去入度为 $0$ 的点来计算。

枚举入度为 $0$ 的点数 $j$，那么将这 $j$ 个点向剩下的点连边的方案数为 $2^{j(i-j)}$。

但是注意这时候仅钦定了这 $j$ 个点度数为 $0$，而剩余的 $i-j$ 个点中可能还有度数为 $0$ 的点，也就是这里是至少有 $j$ 个入度为 $0$ 的点。

考虑二项式反演：设 $p_{i,j}$ 为 $i$ 个点中至少有 $j$ 个点入度为 $0$ 的方案数，$q_{i,j}$ 为 $i$ 个点中恰好有 $j$ 个点入度为 $0$ 的方案数，那么 $f_i=\sum_{j=1}^iq_{i,j}$。

有：
$$
\begin{aligned}
p_{i,j}&=\sum_{k=j}^i\binom{k}{j}q_{i,k}\\
q_{i,j}&=\sum_{k=j}^i(-1)^{k-j}\binom{k}{j}p_{i,k}\\
\end{aligned}
$$
根据前面可得：
$$
p_{i,k}=\binom{i}{k}2^{k(i-k)}f_{i-k}
$$
那么：
$$
\begin{aligned}
f_i&=\sum_{j=1}^iq_{i,j}\\
&=\sum_{j=1}^i\sum_{k=j}^i(-1)^{k-j}\binom{k}{j}\binom{i}{k}2^{k(i-k)}f_{i-k}\\
&=\sum_{k=1}^i\binom{i}{k}2^{k(i-k)}f_{i-k}\sum_{j=1}^k(-1)^{k-j}\binom{k}{j}\\
&=\sum_{k=1}^i\binom{i}{k}2^{k(i-k)}f_{i-k}\left((1-1)^k-(-1)^k\binom{k}{0}\right)\\
&=\sum_{k=1}^i\binom{i}{k}2^{k(i-k)}f_{i-k}(-1)^{k+1}\\
\end{aligned}
$$
我们就得到了 DP 式子：
$$
f_i=\sum_{k=1}^i(-1)^{k+1}\binom{i}{k}2^{k(i-k)}f_{i-k}
$$
有一个 trick：
$$
ij=\binom{i+j}{2}-\binom{i}{2}-\binom{j}{2}
$$
证明比较简单：考虑组合意义，从 $i+j$ 个数中选两个数的方案数减去分别从 $i,j$ 个数中选两个数的方案数，就等于从 $i$ 个数和 $j$ 个数中分别选一个数的方案数，也就是 $ij$。

于是有：
$$
\begin{aligned}
2^{k(i-k)}&=2^{\large\binom{i}{2} - \binom{k}{2} - \binom{i-k}{2}}\\
&=\frac{2^{\large\binom{i}{2}}}{2^{\large\binom{k}{2}}\times 2^{\large\binom{i-k}{2}}}
\end{aligned}
$$
那么就可以写成 EGF 的形式了。设生成函数 $F,G$：
$$
F(x)=\sum_{i\ge 0} \frac{f_i}{i!\times 2^{\large\binom{i}{2}}}x^i
$$

$$
G(x)=\sum_{i\ge 1} \frac{(-1)^{i+1}}{i!\times 2^{\large\binom{i}{2}}}x^i
$$

并且 $f_0=1$，那么就能得出：
$$
F(x)=F(x)G(x)+1
$$
即：
$$
F(x)=\frac{1}{1-G(x)}
$$
那么就可以通过一次多项式求逆得出。

如果需要求弱联通的数量呢？

那么我们可以考虑经典做法：设 $A(x)$ 为有任意个弱连通块的 EGF，$B(x)$ 为有仅一个弱连通块的 EGF，那么就有：
$$
A(x)=e^{B(x)}
$$

$$
B(x)=\ln A(x)
$$



所以再进行一次多项式 $\ln$ 就可以解决这一问题了。

[题目传送门（P6295）](https://www.luogu.com.cn/problem/P6295)

# Code

```cpp
#include <bits/stdc++.h>
using namespace std;
const int MAXN = 400005, P = 998244353, G = 3, GI = 332748118;
int qpow(int a, long long b) {
    int ans = 1;
    while (b) {
        if (b & 1) ans = 1ll * ans * a % P;
        a = 1ll * a * a % P;
        b >>= 1;
    }
    return ans;
}
int r[MAXN];
struct Polynomial {
    vector<int> a;
    int len;
    int& operator[](int b) { return a[b]; }
    Polynomial(int len = 0) : len(len) { a.resize(len + 1); }
    Polynomial& set(int b) { len = b, a.resize(b + 1); return *this; }
    static Polynomial resize(Polynomial a, int s) { Polynomial b = a; return b.set(s); }
    void reverse() { std::reverse(a.begin(), a.end()); }
    static void calcRev(int limit) {
        for (int i = 1; i < limit; i++)
            r[i] = (r[i >> 1] >> 1) | ((i & 1) * limit >> 1);
    }
    void ntt(int limit, bool rev) {
        set(limit);
        for (int i = 0; i < limit; i++)
            if (i < r[i]) swap(a[i], a[r[i]]);
        for (int mid = 1; mid < limit; mid <<= 1) {
            int step = qpow(rev ? GI : G, (P - 1) / (mid << 1));
            for (int l = 0; l < limit; l += (mid << 1)) {
                int w = 1;
                for (int j = 0; j < mid; j++, w = 1ll * w * step % P) {
                    int x = a[l + j], y = 1ll * w * a[l + j + mid] % P;
                    a[l + j] = (x + y) % P, a[l + j + mid] = (1ll * P + x - y) % P;
                }
            }
        }
        int invn = qpow(limit, P - 2);
        if (rev) {
            for (int i = 0; i < limit; i++) 
                a[i] = 1ll * a[i] * invn % P;
        }
    }
    void print() { for (int i : a) printf("%d ", i); printf("\n"); }
    Polynomial operator*(Polynomial b) {
        Polynomial a = *this, c;
        int n = a.len + b.len;
        int limit = 1;
        while (limit <= n) limit <<= 1;
        c.set(limit);
        calcRev(limit);
        a.ntt(limit, 0), b.ntt(limit, 0);
        for (int i = 0; i <= limit; i++) c[i] = 1ll * a[i] * b[i] % P;
        c.ntt(limit, 1);
        c.set(n);
        return c;
    }
    Polynomial operator*(int b) {
        Polynomial c = *this;
        for (int& i : c.a) i = 1ll * i * b % P;
        return c;
    }
    Polynomial operator+(int b) {
        Polynomial c = *this;
        c[0] = (1ll * c[0] + b + P) % P;
        return c;
    }
    Polynomial operator+(Polynomial b) {
        Polynomial c = *this;
        c.set(max(c.len, b.len));
        for (int i = 0; i <= b.len; i++) c[i] = (c[i] + b[i]) % P;
        return c;
    }
    Polynomial operator-(Polynomial b) {
        Polynomial c = *this;
        c.set(max(c.len, b.len));
        for (int i = 0; i <= b.len; i++) c[i] = (c[i] - b[i] + P) % P;
        return c;
    }
    Polynomial inv(int n) {
        Polynomial b;
        b[0] = qpow(a[0], P - 2);
        for (int d = 1; d < (n << 1); d <<= 1) {
            Polynomial a = *this;
            a.set(d - 1);
            int limit = d << 1;
            calcRev(limit);
            a.ntt(limit, 0), b.ntt(limit, 0);
            for (int i = 0; i < limit; i++) b[i] = (2ll - 1ll * a[i] * b[i] % P + P) % P * b[i] % P;
            b.ntt(limit, 1);
            b.set(d - 1);
        }
        b.set(n - 1);
        return b;
    }
    Polynomial derivative() {
        Polynomial b(len - 1);
        for (int i = 1; i <= len; i++) b[i - 1] = 1ll * a[i] * i % P;
        return b;
    }
    Polynomial integral() {
        Polynomial b(len + 1);
        for (int i = 0; i <= len; i++) b[i + 1] = 1ll * a[i] * qpow(i + 1, P - 2) % P;
        return b;
    }
    Polynomial ln(int n) {
        return (derivative() * inv(n)).integral().set(n - 1);
    }
};
int t;
int fac[MAXN];
long long C2(int x) {
    return 1ll * x * (x - 1) / 2;
}
int main() {
    scanf("%d", &t);
    fac[0] = 1;
    for (int i = 1; i <= t; i++) fac[i] = 1ll * fac[i - 1] * i % P;
    Polynomial f, g, h;
    g.set(t);
    for (int i = 1; i <= t; i++) {
        g[i] = ((i & 1) ? 1ll : P - 1ll) * qpow(fac[i], P - 2) % P * qpow((P + 1) / 2, C2(i)) % P;
    }
    f = (g * (-1) + 1).inv(t + 1);
    for (int i = 0; i <= t; i++) {
        f[i] = 1ll * f[i] * qpow(2, C2(i)) % P;
    }
    h = f.ln(t + 1);
    for (int i = 1; i <= t; i++) {
        printf("%lld\n", 1ll * h[i] * fac[i] % P);
    }
    return 0;
}
```

# [CF1466H Finding satisfactory solutions](https://www.luogu.com.cn/problem/CF1466H)

进行一些题意转换后，可以变成类似于求 DAG 数的问题，只是连边时的方案数不太一样。

先咕下，懒得写题解了）