---
layout: post
title: 「模板」LCA倍增，离线，在线算法
date: 2021-07-20
tags: 算法  图论  LCA  模板
---
## 倍增
```cpp
#define forGraph(g,u,v,i) for(int i=g.fst[u],v=g.to[i];i;i=g.nxt[i],v=g.to[i])
int n,k;
struct Graph {
    int fst[MAXN], nxt[MAXN<<1], to[MAXN<<1], tot;
    void add(int u,int v) {
        to[++tot]=v;
        nxt[tot]=fst[u];
        fst[u]=tot;
    }
}g;
int f[MAXN][20], Log[MAXN], depth[MAXN];
void dfs(int i,int pre) {
    if(i!=1) f[i][0]=pre;
    depth[i]=depth[pre]+1;
    forGraph(g,i,j,edge) if(j!=pre) dfs(j,i,edge);
}
void init() {
    Log[1]=0; for(int i=2;i<=n;i++) Log[i]=Log[i/2]+1;
    for(int j=1;j<=Log[n];j++) 
        for(int i=1;i<=n;i++) 
            f[i][j]=f[f[i][j-1]][j-1];
}
int lca(int x,int y) {
    if (depth[x]<depth[y]) swap(x,y);
    int d=depth[x]-depth[y];
    for(int i=0;i<=Log[d];i++) if(d&(1<<i)) x=f[x][i];
    if (x==y) return x;
    for(int j=Log[depth[y]];j>=0;j--) 
        if (f[x][j] && f[x][j]!=f[y][j]) x=f[x][j],y=f[y][j];
    return f[x][0];
}
int main() {
    scanf("%d", &n);
    for(int i=1;i<n;i++) {
        int u,v;
        scanf("%d%d", &u, &v);
        g.add(u,v);
        g.add(v,u);
    }
    dfs(1,1);
    init();
    scanf("%d", &k);
    for(int i=1;i<=k;i++) {
        int x,y;
        scanf("%d%d", &x, &y);
        printf("%d\n", lca(x,y)));
    }
    return 0;
}
```
## 在线（$\mathrm{DFS}$序+$\mathrm{RMQ}$）
```cpp
#define forGraph(g,u,v,i) for(int i=g.fst[u],v=g.to[i];i;i=g.nxt[i],v=g.to[i])
int n,k;
struct Graph {
    int fst[MAXN], nxt[MAXN<<1], to[MAXN<<1], tot;
    void add(int u,int v) {
        to[++tot]=v;
        nxt[tot]=fst[u];
        fst[u]=tot;
    }
}g;
int first[MAXN],dNum;
int lis[MAXN<<1], Log[MAXN], depth[MAXN], st[MAXN<<1][20];
void dfs(int i,int pre) {
    depth[i]=depth[pre]+1;
    first[i]=++dNum;
    lis[dNum]=i;
    forGraph(g,i,j,edge) if(j!=pre) {
        dfs(j,i,edge);
        lis[++dNum]=i;
    }
}
void init() {
    Log[1]=0; for(int i=2;i<=dNum;i++) Log[i]=Log[i/2]+1;
    for(int i=1;i<=dNum;i++) st[i][0]=i;
    for(int j=1;j<=Log[dNum];j++) 
        for(int i=1;i+(1<<j)-1<=dNum;i++) {
            int a=st[i][j-1],b=st[i+(1<<(j-1))][j-1];
            st[i][j]=depth[lis[a]]<depth[lis[b]]?a:b;
        }
}
int lca(int x,int y) {
    x=first[x],y=first[y];
    if (x>y) swap(x,y);
    int len=Log[y-x+1];
    int a = st[x][len], b=st[y-(1<<len)+1][len];
    return lis[depth[lis[a]]<depth[lis[b]]?a:b];
}
int main() {
    scanf("%d", &n);
    for(int i=1;i<n;i++) {
        int u,v;
        scanf("%d%d", &u, &v);
        g.add(u,v);
        g.add(v,u);
    }
    dfs(1,1);
    init();
    scanf("%d", &k);
    for(int i=1;i<=k;i++) {
        int x,y;
        scanf("%d%d", &x, &y);
        printf("%d\n", lca(x,y)));
    }
    return 0;
}
```
## 离线（$\mathrm{Tarjan}$算法）
```cpp
#define forGraph(g,u,v,i) for(int i=g.fst[u],v=g.to[i];i;i=g.nxt[i],v=g.to[i])
int n,k;
struct Graph {
    int fst[MAXN], nxt[MAXN<<1], to[MAXN<<1], w[MAXN<<1], tot;
    void add(int u,int v,int ww) {
        to[++tot]=v;
        nxt[tot]=fst[u];
        fst[u]=tot;
        w[tot]=ww;
    }
}g,ask;
int fa[MAXN],asks[MAXN][2],ans[MAXN];
bitset<MAXN> vis;
int find(int x) {
    if (fa[x]==x) return x;
    return fa[x]=find(fa[x]);
}
void unite(int x,int y) {
    x=find(x),y=find(y);
    if (x!=y) fa[x]=y;
}
void lca(int i) {
    fa[i]=i;
    vis[i]=1;
    forGraph(g,i,j,edge) {
        if (!vis[j]) {
            lca(j);
            unite(j,i);
        }
    }
    forGraph(ask,i,j,edge) {
        if (vis[j]) ans[ask.w[edge]]=find(j);
    }
}
int main() {
    scanf("%d", &n);
    for(int i=1;i<n;i++) {
        int u,v;
        scanf("%d%d", &u, &v);
        g.add(u,v,0);
        g.add(v,u,0);
    }
    scanf("%d", &k);
    for(int i=1;i<=k;i++) {
        scanf("%d%d", &asks[i][0], &asks[i][1]);
        ask.add(asks[i][0],asks[i][1],i);
        ask.add(asks[i][1],asks[i][0],i);
    }
    lca(1);
    for(int i=1;i<=k;i++) printf("%d\n", ans[i]);
    return 0;
}
```