---
layout: post
title: 「学习笔记」求组合数方法大全（杨辉三角，高精度，阶乘逆元递推，Lucas定理，扩展Lucas定理）
date: 2021-07-14
tags: 算法  数学  组合数学  组合数  高精度  Lucas定理  扩展Lucas定理
---
## 0x0 前言
> 这几天做了一堆排列组合的题，本以为小学奥数学过排列组合的我应对这些题没有问题，结果是我想太简单了qwq 总而言之，这里整理一些求组合数的方式.

-------------
## 0x1 $\mathrm{C}_n^m$
###  0x10 $m$ , $n$ 较小时

可以利用杨辉三角预处理出所有的 $\mathrm{C}_n^m$ , 复杂度 $O(n^2)$ .  

递推公式：

$$
\mathrm{C}_n^m=\mathrm{C}_{n-1}^{m-1}+\mathrm{C}_{n-1}^m
$$

**代码实现：**
```cpp
int c[MAXN][MAXN];
void init() {
    c[0][0]=1;
    for (int i=1; i<=n; i++) {
        for (int j=1; j<=i; j++) {
            c[i][j]=c[i-1][j]+c[i-1][j-1];
        }
    }
}
```

------------------
### 0x11 $m$ 与 $n$ 较大时

使用高精度运算. 

因为$\mathrm{C}_n^m=\frac{n!}{m!\cdot (n-m)!}$,  
为避免高精度除法，可以先将分子分母分别分解质因数，再将分子分母的质因数指数相减，再将剩余的质因子乘起来.

**分解 $n!$ :**  
因为 $n!=n\times (n-1)\times (n-2) \times\cdots\times 2 \times1$,   
所以 $n!$ 的质因子一定小于等于 $n$.  
可以首先筛出 $1\sim n$ 的质数，再一一计算指数.  
在 $1\sim n$ 这 $n$ 个数中，是 $p_i$ 的倍数（即至少包含 $1$ 个质因子 $p_i$ 的个数） 的数量是 $\lfloor\frac{n}{p_i}\rfloor$.  
同理，这 $n$ 个数中是 $p_i^2$ 的倍数为 $\lfloor\frac{n}{p_i^2}\rfloor$ 个, 由于在 $p_i$ 的倍数里已经计算过一遍， 所以 $p_i$ 的总指数只需要加 $\lfloor\frac{n}{p_i^2}\rfloor$ 即可.  
综上所述， $n!$ 的 $p_i$ 质因子个数 $c_i$ 为：

$$
c_i=\lfloor\frac{n}{p_i}\rfloor+\lfloor\frac{n}{p_i^2}\rfloor+\lfloor\frac{n}{p_i^3}\rfloor+\cdots+\lfloor\frac{n}{p_i^{\lfloor\log_{p_i}n\rfloor}}\rfloor=\sum_{p_i^k\le n}{\lfloor\frac{n}{p_i^k}\rfloor}
$$

每一个质因子 $p_i$ 的个数求和复杂度 $O(\log n)$ , 总复杂度为 $O(n\log n)$.  
**代码实现：**
```cpp
struct BigInt {
#define P 1000000000
	long long a[4000],t;
	BigInt() {
		memset(a,0,sizeof(a));
		t=1;
		a[1]=1;
	}
	void operator*=(int b) {
		int x=0;
		for(int i=1;i<=t;i++) {
			a[i]=a[i]*b+x;
			x=a[i]/P;
			a[i]%=P;
		}			
		while(x) {
			a[++t]=x%P;
			x/=P;
		}
	}
	void print() {
		printf("%lld", a[t]);
		for(int i=t-1;i>=1;i--) printf("%09lld", a[i]);
		printf("\n");
	}
};
int v[1000000], prime[700000], cnt;
int n,m;
int init() {
	v[1]=1;
	for (int i=2;i<=n;i++) {
		if (v[i]==0) {
			v[i]=i;
			prime[++cnt]=i;
		}
		for(int j=1;j<=cnt&&prime[j]<=v[i]&&i*prime[j]<=n;j++) {
			v[i*prime[j]]=prime[j];
		}
	}
}
int getCi(int n,int p) {
	int cnt=0;
	for (int i=n;i;i/=p) {
		cnt+=i/p;
	}
	return cnt;
}
int main() {
	scanf("%d%d", &n, &m);
	if (m>n) printf("0\n");
	else {
		init();
		BigInt ans;
		for(int i=1;i<=cnt;i++) {
			int c=getCi(n, prime[i])-getCi(m, prime[i])-getCi(n-m, prime[i]);
			while(c--) {
				ans*=prime[i];
			}
		}
		ans.print();
	}
	return 0;
}
```

----------------
## 0x2 $\mathrm{C}_n^m \bmod P$ ( $P$ 为质数 )
### 0x20 $m$ 与 $n$ 较小时
可以首先 $O(n)$ 递推预处理出 $1\sim P-1$ 的阶乘与阶乘的逆元，然后 $O(1)$ 的求出 $\mathrm{C}_n^m$ .  
设 $x!$ 的乘法逆元为 $facInv_x$, 那么

$$
\begin{aligned}
\mathrm{C}_n^m \bmod P=&\frac{n!}{m!\cdot (n-m)!} \bmod P\\
=&n! \cdot facInv_m \cdot facInv_{n-m} \bmod P\\
\end{aligned}
$$

$$
facInv_x=facInv_{x+1}\cdot (x+1)\bmod P
$$

以下为阶乘的逆元的递推公式的推导过程：  

首先求出$N!^{-1}$,  
设$N=a$，则
$$
\begin{aligned}
a!x&\equiv1&\pmod{P}\\
(a-1)!\times ax&\equiv1&\pmod{P}
\end{aligned}
$$
则 $ax$ 即为 $(a-1)!$ 的乘法逆元.  

**代码实现：**
```cpp
int fac[MAXP],inv_fac[MAXP];
int init(int p) {
	fac[0]=fac[1]=1,inv_fac[0]=1; // 重点！！ 否则边界情况会出错
	for(int i=2;i<p;i++) fac[i]=fac[i-1]*i%p;
	inv_fac[p-1]=qpow(fac[p-1], p-2, p); // 快速幂求逆元
	for(int i=p-2;i;i--) inv_fac[i]=inv_fac[i+1]*(i+1)%p;
}
int C(int n,int m,int p) {
	if (m>n) return 0;
	return fac[n]*inv_fac[m]%p*inv_fac[n-m]%p;
}

```

-------------------
### 0x21 $m$ 与 $n$ 较大时
运用Lucas定理求解.

$$
\mathrm{C}_n^m \bmod P = \mathrm{C}_{n\bmod P}^{m\bmod P} \times \mathrm{C}_{n/ P}^{m/P} \bmod P
$$

并且通过上一种情况的方式预处理出 $1 \sim P-1$ 的阶乘与阶乘逆元.  
然后就可以 $O(1)$ 的求出 $\mathrm{C}_{n\bmod P}^{m\bmod P}$ .      
而 $\mathrm{C}_{n/P}^{m/P}$ 可以通过Lucas定理递归求解. 

**代码实现：**
```cpp
int fac[MAXP],inv_fac[MAXP];
int init(int p) {
	fac[0]=fac[1]=1,inv_fac[0]=1;
	for(int i=2;i<p;i++) fac[i]=fac[i-1]*i%p; // 重点！！ 否则边界情况会出错
	inv_fac[p-1]=qpow(fac[p-1], p-2, p); // 快速幂求逆元
	for(int i=p-2;i;i--) inv_fac[i]=inv_fac[i+1]*(i+1)%p;
}
int C(int n,int m,int p) {
	if (m>n) return 0;
	return fac[n]*inv_fac[m]%p*inv_fac[n-m]%p;
}
int Lucas(int n,int m,int p) {
	if (m==0) return 1;
	return Lucas(n/p,m/p,p)*C(n%p,m%p,p)%p;
}
```

---------------------------
## 0x3 $\mathrm{C}_n^m \bmod P$ ( $P$ 为合数 )
运用扩展Lucas定理求解.
> 以下涉及知识： 中国剩余定理（CRT） 0x11 部分知识

首先将 $P$ 分解质因数， 得到 $P = p_1^{c_1}p_2^{c_2}\cdots p_k^{c_k}$.  
每一个 $p_i^{c_i}$ 一定是互质的, 那么我们可以用 $\mathrm{C}_n^m$ 分别对每一个 $p_i^{c_i}$ 进行取模，组成下面的同余方程组：

$$
\left\{
\begin{aligned}
x\equiv &\ \mathrm{C}_n^m &\pmod{p_1^{c_1}} \\
x\equiv &\ \mathrm{C}_n^m &\pmod{p_2^{c_2}} \\
&\vdots\\
x\equiv &\ \mathrm{C}_n^m &\pmod{p_k^{c_k}} 
\end{aligned}
\right.
$$

运用中国剩余定理求解即可.  

接下来我们要来求 $\mathrm{C}_n^m \bmod p_i^{c_i}$，即求$\frac{n!}{m!(n-m)!} \bmod p_i^{c_i}$.  
因为我们不知道 $p_i^{c_i}$ 与 $m, n$ 的大小关系，也就是说 $m!(n-m)!$ 可能不与 $p_i^{c_i}$ 互质，所以我们不可以直接通过求乘法逆元求解.  
为了使 $m!(n-m)!$ 与 $p_i^{c_i}$ 互质，我们可以将它们其中的所有 $p_i$ 质因子提取出来，同时我们可以将 $n!$ 中的 $p_i$ 质因子也提取出来，这样提取出来一定是正整数.  
记 $n!,m!,(n-m)!$ 中的 $p_i$ 质因子的指数为 $k_1,k_2,k_3$，则我们要求的式子可以转化为：

$$
\large\frac{\frac{n!}{p_i^{k_1}}}{\frac{m!}{p_i^{k_2}}\cdot\frac{(n-m)!}{p_i^{k_3}}} \cdot p_i^{k_1-k_2-k_3}\bmod p_i^{c_i}
$$

这样，$\frac{m!}{p_i^{k_2}}$ 与 $\frac{(n-m)!}{p_i^{k_3}}$ 就一定和 $p_i^{c_i}$ 互质，就可以求出它们的乘法逆元.  
那么，我们只需要求出 $\frac{n!}{p_i^{k_1}},\frac{m!}{p_i^{k_2}}$ 与 $\frac{(n-m)!}{p_i^{k_3}}$ 即可求出整个式子的值.  

接下来求 $\frac{n!}{p_i^k}\bmod p_i^{c_i}$ 的值.  
由 0x11 我们可以得知， $c_i=\lfloor\frac{n}{p_i}\rfloor+\lfloor\frac{n}{p_i^2}\rfloor+\lfloor\frac{n}{p_i^3}\rfloor+\cdots+\lfloor\frac{n}{p_i^{\lfloor\log_{p_i}n\rfloor}}\rfloor=\sum_{p_i^k\le n}{\lfloor\frac{n}{p_i^k}\rfloor}$ .   
然后来看 $n!\bmod p_i^{c_i}$.  
举个例子， 假如我们求 $20! \bmod 3^2$， 那么 $13!$ 可以化为以下形式：  

$$
\begin{aligned}
20!&=1\times2\times3\times4\times5\times6\times7\times8\times9\times10\\
&\times11\times12\times13\times14\times15\times16\times17\times18\times19\times20\\
&=3^6\times(1\times2\times3\times4\times5\times6) \times1\times2\times4\\
&\times5\times7\times8\times10\times11\times13\times14\times16\times17\times19\times20
\end{aligned}
$$

将 $3$ 的倍数中的 $3$ 全部提取出来后，可以发现里面是 $6!$ 的形式，也就是 $\lfloor \frac{n}{p_i}\rfloor!$ .  
剩下的我们可以这样来划分：

$$
\begin{aligned}
20!&=3^6\times(1\times2\times3\times4\times5\times6) \times1\times2\times4\times5\\
&\times7\times8\times10\times11\times13\times14\times16\times17\times19\times20\\
&=3^6\times(1\times2\times3\times4\times5\times6)\times(1\times2\times4\times5\\
&\times7\times8)\times(10\times11\times13\times14\times16\times17)\times(19\times20)
\end{aligned}
$$

不难发现， 

$$1\times2\times4\times5\times7\times8 \equiv 10\times11\times13\times14\times16\times17 \pmod{3^2}$$

$$1\times2 \equiv 19\times20 \pmod{3^2}$$

也就是剩余部分相当于是 $(1\times2\times4\times5\times7\times8)^2\times(1\times2)$， 即

$$
\left(\prod_{i=1,i\nmid p_i}^{p_i^{c_i}}{i}\right)^{\large\left\lfloor\frac{n}{p_i^{c_i}}\right\rfloor}\times\prod_{i=1,i\nmid p_i}^{n\bmod p_i^{c_i}}{i}
$$

我们只需要暴力求出 $\prod_{i=1,i\nmid p_i}^{p_i^{c_i}}{i}$ 与 $\prod_{i=1,i\nmid p_i}^{n\bmod p_i^k}{i}$， 然后快速幂求出即可.  
回归 $\frac{n!}{p_i^{c_i}}\bmod p_i^{c_i}$， 我们需要将 $n!$ 中的所有 $p_i$ 质因子消掉，我们已经将质因子 $p_i$ 提取出来了， 那么直接消去即可.  
$\lfloor \frac{n}{p_i}\rfloor!$ 的部分我们可以通过递归求解，同样其中的 $p_i$ 质因子消掉，也就是我们只需要后两部分相乘得出结果即可.  

一切工作都准备完成了，接下来我们只需要将原式子求出即可，再重复 $k$ 次，将 $\mathrm{C}^n_m \bmod p_i$ 的值全部求出，再运用中国剩余定理求出同余方程组最的小的正整数解即可.  

**代码实现：**
```cpp
int n,m,p,pp[15],pc[15],pk[15],pcnt,a[15];
void split() {
	int t=p;
	for(int i=2;i<=sqrt(p);i++) {
		if (t%i==0) {
			pcnt++;
			pp[pcnt]=i;
			pk[pcnt]=1;
			while(t%i==0) {
				t/=i;
				pk[pcnt]*=i;
				pc[pcnt]++;
			}
		}
	}
	if (t>1) {
		pcnt++;
		pp[pcnt]=t;
		pk[pcnt]=t;
		pc[pcnt]=1;
	}
}
int gcd(int a,int b) {
	return b==0?a:gcd(b,a%b);
}
void exgcd(int a,int b,int &d,int &x,int &y) {
	if (!b) d=a,x=1,y=0;
	else {
		exgcd(b, a%b, d, x, y);
		int t=x;x=y;y=t-(a/b)*y;
	}
}
int equiv(int a,int b,int p) {
	int d,x,y;
	exgcd(a, p, d, x, y);
	if (b%d==0) return (x*(b/d)%(p/d)+(p/d))%(p/d);
	return 0;
}
int inv(int a,int p) {
	int ret = equiv(a, 1, p);
	return ret;
}
int CRT() {
	int ans=0;
	for(int i=1;i<=pcnt;i++) {
		int Mi = p / pk[i];
		ans = (ans + Mi*a[i]%p*inv(Mi,pk[i])%p)%p;
	}
	return ans;
}
int qpow(int a,int b,int p) {
	int t=b,q=a;
	int ans=1;
	while(b) {
		if (b&1) ans=ans*a%p;
		a=a*a%p;
		b>>=1;
	}
	return ans;
}
int fac(int n,int pk,int p) {
	if (n==0) return 1;
	int ans=1;
	for(int i=1;i<pk;i++) {
		if (i%p) {
			ans=ans*i%pk;			
		}
	}
	ans=qpow(ans, n/pk, pk);
	for(int i=1;i<=n%pk;i++) {
		if (i%p) {
			ans=ans*i%pk;
		}
	}
	int ret = fac(n/p, pk, p) * ans % pk;
	return ret;
}
int calc(int pk, int p) {
	int cnt=0;
	int f1=fac(n, pk, p),f2=fac(m, pk, p),f3=fac(n-m, pk, p);
	for(int i=n;i;i/=p) {
		cnt+=i/p;
	}
	for(int i=m;i;i/=p) {
		cnt-=i/p;
	}
	for(int i=n-m;i;i/=p) {
		cnt-=i/p;
	}
	int ans=f1*inv(f2, pk)%pk*inv(f3, pk)%pk*qpow(p, cnt, pk)%pk;
	return ans;
}
int main() {
    scanf("%d%d%d", &n, &m, &p);
	ExLucas::split();
	for(int i=1;i<=pcnt;i++) a[i]=calc(pk[i], pp[i]);
	printf("%d\n", CRT());
	return 0;
}
```