---
layout: post
title: 「解题报告」网络流板子集合
date: 2022-02-13
tags: 网络流  费用流  上下界最大流  上下界最小费用流
---

# 最大流 / 最小割
```cpp
const int inf = INT_MAX / 2;
struct Graph {
    int fst[MAXN], nxt[MAXM], to[MAXM], d[MAXN], now[MAXN], f[MAXM], tot;
    Graph() : tot(1) {}
    int add(int u, int v, int w) {
        to[++tot] = v, f[tot] = w, nxt[tot] = fst[u], fst[u] = tot;
        to[++tot] = u, f[tot] = 0, nxt[tot] = fst[v], fst[v] = tot;
        return tot - 1;
    }
    int s, t;
    bool bfs() {
        memset(d, 0, sizeof d);
        memcpy(now, fst, sizeof fst);
        queue<int> q; q.push(s); d[s] = 1;
        while (!q.empty()) {
            int u = q.front(); q.pop();
            for (int i = fst[u]; i; i = nxt[i]) {
                int v = to[i];
                if (f[i] && !d[v]) {
                    q.push(v);
                    d[v] = d[u] + 1;
                    if (v == t) return true;
                }
            }
        }
        return false;
    }
    int dinic(int u, int flow) {
        if (u == t) return flow;
        int rest = flow;
        for (int &i = now[u], v = to[i]; i; i = nxt[i], v = to[i]) {
            if (f[i] && d[v] == d[u] + 1) {
                int k = dinic(v, min(rest, f[i]));
                if (!k) d[v] = 0;
                f[i] -= k, f[i ^ 1] += k, rest -= k;
            }
            if (!rest) break;
        }
        return flow - rest;
    }
    int solve() {
        int flow, maxflow = 0;
        while (bfs())
            while (flow = dinic(s, inf)) maxflow += flow;
        return maxflow;
    }
}g;
```

# 最小费用最大流

```cpp
const int inf = 0x3f3f3f3f;
struct Graph {
    int fst[MAXN], now[MAXN], d[MAXN], s, t;
    int nxt[MAXM], to[MAXM], f[MAXM], c[MAXM], tot;
    void add(int u, int v, int w, int d) {
        to[++tot] = v, nxt[tot] = fst[u], f[tot] = w, c[tot] = d, fst[u] = tot;
        to[++tot] = u, nxt[tot] = fst[v], f[tot] = 0, c[tot] = -d, fst[v] = tot;
    }
    Graph() : tot(1) {}
    bool vis[MAXN];
    bool spfa() {
        memset(d, 0x3f, sizeof d);
        memcpy(now, fst, sizeof fst);
        queue<int> q; d[s] = 0, vis[s] = 1, q.push(s);
        while (!q.empty()) {
            int u = q.front(); q.pop();
            vis[u] = 0;
            for (int i = fst[u], v = to[i]; i; i = nxt[i], v = to[i]) {
                if (f[i] && d[u] + c[i] < d[v]) {
                    d[v] = d[u] + c[i];
                    if (!vis[v]) vis[v] = 1, q.push(v);
                } 
            }
        }
        return d[t] != inf;
    }
    int dfs(int u, int flow, int &cost) {
        if (u == t) return flow;
        int rest = flow;
        vis[u] = 1;
        for (int &i = now[u], v = to[i]; i; i = nxt[i], v = to[i]) {
            if (!vis[v] && f[i] && d[v] == d[u] + c[i]) {
                int k = dfs(v, min(rest, f[i]), cost);
                if (!k) d[v] = -1;
                f[i] -= k, f[i ^ 1] += k, rest -= k, cost += c[i] * k;
            }
            if (!rest) break;
        }
        vis[u] = 0;
        return flow - rest;
    }
    pair<int, int> dinic() {
        int flow, maxflow = 0, cost = 0;
        while (spfa())
            while (flow = dfs(s, inf, cost)) maxflow += flow;
        return {maxflow, cost};
    }
}g;
```

# 有源汇上下界最大流

```cpp
const int inf = INT_MAX / 2;
struct Graph {
    int fst[MAXN], nxt[MAXM], to[MAXM], f[MAXM], now[MAXN], d[MAXN], tot;
    int s, t;
    int in[MAXN], out[MAXN];
    int ncnt; int operator()() { return ++ncnt; } // 点数
    void init() {
        tot = 1, ncnt = 0;
        memset(fst, 0, sizeof fst);
        memset(in, 0, sizeof in);
        memset(out, 0, sizeof out);
    }
    int add(int u, int v, int l, int r) {
        to[++tot] = v, f[tot] = r - l, nxt[tot] = fst[u], fst[u] = tot;
        to[++tot] = u, f[tot] = 0, nxt[tot] = fst[v], fst[v] = tot;
        in[v] += l, out[u] += l;
        return tot - 1;
    }
    bool bfs() {
        memset(d, 0, sizeof d);
        memcpy(now, fst, sizeof fst);
        queue<int> q; q.push(s); d[s] = 1;
        while (!q.empty()) {
            int u = q.front(); q.pop();
            for (int i = fst[u], v = to[i]; i; i = nxt[i], v = to[i]) {
                if (f[i] && !d[v]) {
                    q.push(v);
                    d[v] = d[u] + 1;
                    if (v == t) return true;
                }
            }
        }
        return false;
    }
    int dfs(int u, int flow) {
        if (u == t) return flow;
        int rest = flow;
        for (int &i = now[u], v = to[i]; i; i = nxt[i], v = to[i]) {
            if (f[i] && d[v] == d[u] + 1) {
                int k = dfs(v, min(rest, f[i]));
                if (!k) d[v] = 0;
                f[i] -= k, f[i ^ 1] += k, rest -= k;
            }
            if (!rest) break;
        }
        return flow - rest;
    }
    int dinic(int S, int T) {
        s = S, t = T;
        int flow, maxflow = 0;
        while (bfs()) while (flow = dfs(S, inf)) maxflow += flow;
        return maxflow;
    }
    int solve(int S, int T) {
        int k = add(T, S, 0, inf);
        int ss = ++ncnt, tt = ++ncnt;
        int sum = 0;
        for (int i = 1; i <= ncnt; i++) {
            if (in[i] > out[i]) add(ss, i, 0, in[i] - out[i]), 
                sum += in[i] - out[i];
            if (in[i] < out[i]) add(i, tt, 0, out[i] - in[i]);
        }
        int ans = dinic(ss, tt);
        if (ans != sum) return -1; // 可行流到这里就结束
        f[k] = f[k ^ 1] = 0;
        return ans + dinic(S, T);
        // 最小流：ans - dinic(T, S);
    }
}g;
```

# 有源汇上下界最小费用可行流

```cpp
const int inf = 0x3f3f3f3f;
struct Graph {
    int fst[MAXN], nxt[MAXM], to[MAXM], f[MAXM], now[MAXN], d[MAXN], tot;
    int c[MAXM];
    bool vis[MAXN];
    int s, t, in[MAXN], out[MAXN], sum;
    int ncnt; int operator()() { return ++ncnt; } // 点数
    void init() {
        tot = 1, ncnt = 0;
        memset(fst, 0, sizeof fst);
        memset(in, 0, sizeof in);
        memset(out, 0, sizeof out);
    }
    void add(int u, int v, int l, int r, int V) {
        to[++tot] = v, f[tot] = r - l, nxt[tot] = fst[u], fst[u] = tot, c[tot] = V;
        to[++tot] = u, f[tot] = 0, nxt[tot] = fst[v], fst[v] = tot, c[tot] = -V;
        sum += l * V;
        in[v] += l, out[u] += l;
    }
    bool spfa() {
        memset(d, 0x3f, sizeof d);
        memcpy(now, fst, sizeof fst);
        queue<int> q; d[s] = 0, vis[s] = 1; q.push(s);
        while (!q.empty()) {
            int u = q.front(); q.pop(); vis[u] = 0;
            for (int i = fst[u], v = to[i]; i; i = nxt[i], v = to[i]) {
                if (f[i] && d[v] > d[u] + c[i]) {
                    d[v] = d[u] + c[i];
                    if (!vis[v]) vis[v] = 1, q.push(v);
                }
            }
        }
        return d[t] != inf;
    }
    int dfs(int u, int flow, int &cost) {
        if (u == t) return flow;
        int rest = flow;
        vis[u] = 1;
        for (int &i = now[u], v = to[i]; i; i = nxt[i], v = to[i]) {
            if (!vis[v] && f[i] && d[v] == d[u] + c[i]) {
                int k = dfs(v, min(rest, f[i]), cost);
                if (!k) d[v] = -1;
                f[i] -= k, f[i ^ 1] += k, rest -= k, cost += k * c[i];
            }
            if (!rest) break;
        }
        vis[u] = 0;
        return flow - rest;
    }
    int solve() {
        int ss = ++ncnt, tt = ++ncnt;
        s = ss, t = tt;
        for (int i = 1; i <= ncnt; i++) {
            if (in[i] < out[i]) add(i, tt, 0, out[i] - in[i], 0);
            if (in[i] > out[i]) add(ss, i, 0, in[i] - out[i], 0);
        }
        int flow, maxflow = 0, cost = 0;
        while (spfa())
            while (flow = dfs(ss, inf, cost)) maxflow += flow;
        return cost + sum;
    }
}g;
```