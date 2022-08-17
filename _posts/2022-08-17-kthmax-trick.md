---
layout: post
title: 「解题报告」背包（一类求前 $k$ 大答案的 trick）
date: 2022-08-17
tags: 算法  解题报告  模拟赛
---

> # 题目大意
>
> 有 $n$ 个物品，每个物品有一个颜色 $c_i$ 和一个权值 $w_i$，有 $m$ 个背包，第 $i$ 个背包只能放颜色为 $i$ 的物品，要求每个背包放的物品个数为 $[l_I,\,r_i]$，求前 $k$ 大的权值。
>
> $n,\,m,\,  k\le 2\times 10^5,\, w_i\le 10^9$

首先考虑 $l_i=r_i=1$ 怎么做：

即：每个背包有若干种选择方案，只需要求所有选择方案中权值和为前 $k$ 大的即可。

这里有一个求前 $k$ 大权值和的 trick：

我们考虑按照权值从小到大遍历所有可能的状态，这样虽然总状态数是很大的，但是我们只需要遍历 $k$ 个状态，所以是可以保证复杂度的。

具体的，我们用一个堆维护现在的一个状态，每次取出堆顶，并寻找这个状态的所有后继状态，将它们压入堆中，一直重复 $k$ 轮。

这里的后继状态要满足两个条件：

1. 必须能不重不漏的遍历到所有的状态
2. 后继状态的权值大于等于当前状态的权值

为什么这样就能保证进行 $k$ 轮得到的就是前 $k$ 小的权值？我们保证后继状态权值大于等于当前权值，就保证了每次取到的权值一定不会比上一次小，并且我们还不重不漏的遍历到了所有状态，所以这样取的顺序一定是所有状态中从小到大的。

对于这一道题，一个很直接的想法就是：我们先把每个背包权值按照从小到大排序，维护一个状态表示每个背包现在取到了哪个位置，每次将一个背包选取的物品向后移动，就能满足上面的两个条件了。

但是这个方法的问题是：后继状态是 $O(m)$ 的，这样总复杂度是 $O(mk\operatorname{polylog})$ 的，显然不能接受。

考虑如何只用 $O(1)$ 个后继状态来遍历所有情况：

首先我们可以按位确定每一个背包选什么数，那么我们就有这样两个转移：

（设背包 $u$ 选取的物品为 $d_u$，这里 $d_u$ 是指每个背包的物品按照权值排好序后的下标）

1. 将当前的背包选取的物品向后移动 $d_u\gets d_u+1$
2. 将现在考虑的物品向后移动一位 $u \gets u + 1$

但是这样有一个问题：第二个转移中，我们仅仅将选择的指针移动了一位，并没有实质改变当前的状态，所以这个状态是重复的。

所以我们考虑钦定向后移动一位之后先选择上一个物品，这样状态就不重复了。但是我们还有不移动的情况，也就是这一个背包就选第一个物品的情况。这时候我们要将现在选的这个物品退回去，再继续往后选。这样就满足了第一个条件。

具体的，

1. 将当前的背包选取的物品向后移动 $d_u\gets d_u+1$
2. 考虑下一个背包，并向后移动物品 $u \gets u + 1,\, d_u \gets d_u + 1$
3. 若 $d_{u} = 2$，将当前数退回，并向后移动 $d_{u+1} \gets d_{u+1} - 1,\,u \gets u + 1,\,d_u\gets d_u+1$

此时考虑第二个条件：第一、二的转移显然是满足的，第三个转移中权值的变化量为 $(w_{u,1} - w_{u,2}) + (w_{u+1,2} - w_{u+1,1})$，所以我们只需要满足 $w_{u,2} - w_{u,1} < w_{u+1,2} - w_{u+1,1}$ 即可，那么直接按照最小值减次小值排序即可。

于是 $l_i=r_i=1$ 就做完了。

考虑没有这个限制怎么做：我们可以把每个背包的每个选择方案的权值和也看作一个物品，按照上面的方法去做。

那么我们要求的就是每个背包的选择方案的前 $k$ 小权值。

同样的方法，我们继续设计后继状态：考虑选择 $t$ 个物品，这 $t$ 个物品分别是 $b_1,b_2,\cdots,b_t$。

我们先选择前 $t$ 小的物品，考虑将这些物品向右移动。

那么有如下转移：

1. 若 $b_u+1<b_{u+1}$，$b_u\gets b_u+1$
2. 若 $b_{u-1}+1<b_u$，$b_{u-1}\gets b_{u-1} + 1,\,u\gets u-1$

然后我们就将每一种物品数量全部放入一个堆中，对于每一个背包维护一个堆就可以维护了。

然后只需要将第一部分的权值变化量修改为每次从堆中取元素计算即可。

# Code

```cpp
#include <bits/stdc++.h>
using namespace std;
const int MAXN = 200005;
int n, m, k;
struct Vector : vector<int> { int id; };
Vector v[MAXN];
Vector v2[MAXN];
vector<long long> vp[MAXN];
int l[MAXN], r[MAXN];
struct State1 {
    long long w;
    int q, u;
    bool operator<(const State1 &b) const {
        return w > b.w;
    }
};
struct State2 {
    long long w;
    int q, u, p;
    bool operator<(const State2 &b) const {
        return w > b.w;
    }
};
priority_queue<State1> q1;
priority_queue<State2> q2[MAXN];
vector<long long> f[MAXN];
long long getQ2Top(int c) {
    if (q2[c].empty()) return LLONG_MAX / 4;
    State2 t = q2[c].top(); q2[c].pop();
    int u = t.u, q = t.q, p = t.p;
    if (u != -1) {
        if (q + 1 < p) {
            State2 nt = t;
            nt.q++;
            nt.w += v[c][q + 1] - v[c][q];
            q2[c].push(nt);
        }
        if (u != 0 && u < q) {
            State2 nt = t;
            nt.q = u;
            nt.w += v[c][u] - v[c][u - 1];
            nt.u--;
            nt.p = q;
            q2[c].push(nt);
        }
    }
    return t.w;
}
long long getQ2(int c, int d) {
    while (f[c].size() < d) f[c].push_back(getQ2Top(c));
    return f[c][d - 1];
}
State2 getQ2State(int c, int d) {
    State2 s;
    s.p = v[c].size();
    s.q = d - 1;
    s.u = d - 1;
    s.w = d == 0 ? 0 : vp[c][d - 1];
    return s;
}
long long getQ1Top() {
    if (q1.empty()) return -1;
    State1 t = q1.top(); q1.pop();
    int u = t.u, q = t.q;
    {
        State1 nt = t;
        nt.q++;
        nt.w += getQ2(v2[u].id, q + 2) - getQ2(v2[u].id, q + 1);
        if (nt.w < LLONG_MAX / 4) q1.push(nt);
    }
    if (v2[u + 1].size()) {
        State1 nt = t;
        nt.u++;
        nt.q = 1;
        nt.w += getQ2(v2[u + 1].id, 2) - getQ2(v2[u + 1].id, 1);
        if (nt.w < LLONG_MAX / 4) q1.push(nt);
    }
    if (u != m && q == 1 && u != 1) {
        State1 nt = t;
        nt.u++;
        nt.q = 1;
        nt.w += u == m ? -getQ2(v2[u].id, 2) : getQ2(v2[u + 1].id, 2) - getQ2(v2[u + 1].id, 1) + getQ2(v2[u].id, 1) - getQ2(v2[u].id, 2);
        if (nt.w < LLONG_MAX / 4) q1.push(nt);
    }
    return t.w;
}
int main() {
    freopen("knapsack.in", "r", stdin);
    freopen("knapsack.out", "w", stdout);
    scanf("%d%d%d", &n, &m, &k);
    for (int i = 1; i <= n; i++) {
        int c, a; scanf("%d%d", &c, &a);
        v[c].push_back(a);
    }
    for (int i = 1; i <= m; i++) scanf("%d%d", &l[i], &r[i]), v[i].id = i;
    for (int i = 1; i <= m; i++) sort(v[i].begin(), v[i].end());
    for (int i = 1; i <= m; i++) {
        if (v[i].size() == 0 && l[i] != 0) {
            for (int i = 1; i <= k; i++) printf("-1\n");
            return 0;
        }
    }
    for (int i = 1; i <= m; i++) {
        vp[i].resize(v[i].size());
        if (vp[i].size()) vp[i][0] = v[i][0];
        for (int j = 1; j < v[i].size(); j++)
            vp[i][j] = v[i][j] + vp[i][j - 1];
        for (int j = l[i]; j <= min(r[i], (int) v[i].size()); j++) {
            State2 s = getQ2State(i, j);
            q2[i].push(s);
        }
    }
    for (int i = 1; i <= m; i++) v2[i] = v[i];
    sort(v2 + 1, v2 + 1 + m, [&](Vector &a, Vector &b) {
        return getQ2(a.id, 2) - getQ2(a.id, 1) < getQ2(b.id, 2) - getQ2(b.id, 1);
    });
    State1 s;
    s.q = 0;
    s.u = 1;
    s.w = 0;
    for (int i = 1; i <= m; i++) if (v[i].size()) s.w += getQ2(i, 1);
    q1.push(s);
    for (int i = 1; i <= k; i++) printf("%lld\n", getQ1Top());
    return 0;
}
```