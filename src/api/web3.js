import Web3 from 'web3'
import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'
import BigNumber from 'bignumber.js'
import {splitSignature} from '@ethersproject/bytes'
import * as k from './tokenlist.json'

export const getTokenList = () => {
    const tokenList = k.default.tokens
    const tokenList2 = {}
    tokenList.map((item) => {
        //console.log(item)
        if (item.chainId === 128) {
            tokenList2[item.address] = item
        }
    })
    return tokenList2
}

//获取所有的交易对可能性组合
export const getPairList = () => {
    const tokenList2 = getTokenList()
    const tokenList3 = []
    const defaultToken = ['0xa71edc38d189767582c38a3145b5873052c3e47a', '0x5545153ccfca01fbd7dd11c0b23ba694d9509a6f']
    for (let i in tokenList2) {
        for (let j in defaultToken) {
            if (i != defaultToken[j]) {
                tokenList3.push([i, defaultToken[j]])
            }
        }
    }
    return tokenList3
}


export const maxamount = (amount, decimals = 18, incoming = true) => {
    const factor = new BigNumber(10 ** Number(decimals))
    if (incoming) {
        return new BigNumber(amount.toString()).div(factor)
    } else {
        return new BigNumber(amount.toString()).times(factor)
    }
}

export const getData = (account, name, chainId, pairAddress, routerAddress, liquidityAmount, nonce, deadline) => {
    const EIP712Domain = [
        {name: 'name', type: 'string'},
        {name: 'version', type: 'string'},
        {name: 'chainId', type: 'uint256'},
        {name: 'verifyingContract', type: 'address'},
    ]
    const domain = {
        // name: 'Pancake LPs',
        name: name,
        version: '1',
        chainId: chainId,
        verifyingContract: pairAddress,
    }
    const Permit = [
        {name: 'owner', type: 'address'},
        {name: 'spender', type: 'address'},
        {name: 'value', type: 'uint256'},
        {name: 'nonce', type: 'uint256'},
        {name: 'deadline', type: 'uint256'},
    ]
    const message = {
        owner: account,
        spender: routerAddress,
        value: liquidityAmount,
        nonce: nonce,
        deadline: deadline,
    }
    return JSON.stringify({
        types: {
            EIP712Domain,
            Permit,
        },
        domain,
        primaryType: 'Permit',
        message,
    })
    //return data;
}

export async function connect() {
    const providerOptions = {
        walletconnect: {
            package: WalletConnectProvider,
            bridge: 'https://bridge.walletconnect.org',
            options: {
                rpc: {
                    1: 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
                    3: 'https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
                    4: 'https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
                    5: 'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
                    42: 'https://kovan.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
                    56: 'https://bsc-dataseed1.defibit.io/',
                    65: 'https://exchaintestrpc.okex.org',
                    66: 'https://exchainrpc.okex.org',
                    70: 'https://http-mainnet.hoosmartchain.com',
                    97: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
                    128: 'https://http-mainnet-node.huobichain.com',
                    170: 'https://http-testnet.hoosmartchain.com',
                    256: 'https://http-testnet.hecochain.com',
                    20212: 'https://zsc.one/rpc'
                }
            }
        }
    }
    const web3Modal = new Web3Modal({
        cacheProvider: true,
        providerOptions
    })
    const provider = await web3Modal.connect()
    const web3 = new Web3(provider)

    //获取当前网络ID
    const getChainId = async () => {
        return await web3.eth.getChainId()
        //return chainId
    }

    //获取当前区块
    const getBlockNumber = async () => {
        return await web3.eth.getBlockNumber()
        //return BlockNumber
    }

    //获取当前节点信息
    const getNodeInfo = async () => {
        return await web3.eth.getNodeInfo()
        //return NodeInfo
    }

    //获取默认钱包账号
    const getAccount = async () => {
        const accounts = await web3.eth.getAccounts()
        return accounts[0]
    }

    //获取账号ETH余额
    const getBalance = async (account) => {
        return await web3.eth.getBalance(account)
        //return Balance
    }

    //获取代币精度
    const erc20Decimals = async (tokenAddress, tokenAbi) => {
        const contract = new web3.eth.Contract(JSON.parse(tokenAbi), tokenAddress)
        try {
            return await contract.methods.decimals().call()
            //return tx
        } catch (e) {
            return -1
        }
    }

    //代币授权给合约
    const erc20Approve = async (tokenAddress, tokenAbi, spender, amount, defaultAccount) => {
        const contract = new web3.eth.Contract(JSON.parse(tokenAbi), tokenAddress)
        const decimals = await contract.methods.decimals().call()
        try {
            const tx = await contract.methods.approve(spender, maxamount(amount, decimals, false)).send({from: defaultAccount})
            return tx.status
        } catch (e) {
            return false
        }
    }

    //获取代币的精度
    const getErc20Decimals = async (tokenAddress, tokenAbi) => {
        const contract = new web3.eth.Contract(JSON.parse(tokenAbi), tokenAddress)
        return await contract.methods.decimals().call()
        //return decimals
    }

    const getErc20balance = async (tokenAddress, tokenAbi, defaultAccount) => {
        const contract = new web3.eth.Contract(JSON.parse(tokenAbi), tokenAddress)
        return await contract.methods.balanceOf(defaultAccount).call()
        //return balance
    }

    //转账普通代币
    const erc20Transfer = async (tokenAddress, tokenAbi, recipient, amount, defaultAccount) => {
        const contract = new web3.eth.Contract(JSON.parse(tokenAbi), tokenAddress)
        const decimals = await contract.methods.decimals().call()
        try {
            const tx = await contract.methods.transfer(recipient, maxamount(amount, decimals, false)).send({from: defaultAccount})
            return tx.status
        } catch (e) {
            return false
        }
    }

    //转账eth
    const gasTransfer = async (recipient, amount, defaultAccount) => {
        try {
            const tx = await web3.eth.sendTransaction({
                from: defaultAccount,
                to: recipient,
                value: maxamount(amount, 18, false),
            })
            return tx.status
        } catch (e) {
            return false
        }
    }

    //普通交易对流动性移除
    const removeLiquidity = async (pairAbi, pairAddress, routerAbi, routerAddress, percentage) => {
        //交易对调用的方法列表: name,token0,token1,nonces,balanceOf,decimals,getReserves,totalSupply
        //路由调用的方法列表: removeLiquidityWithPermit,removeLiquidityETHWithPermit
        try {
            const ChainId = await getChainId()
            const defaultAccount = await getAccount()
            const blockNumber = await getBlockNumber()
            const {timestamp} = await web3.eth.getBlock(blockNumber)
            const deadline = timestamp + 600
            const contract = new web3.eth.Contract(JSON.parse(pairAbi), pairAddress)
            const name = await contract.methods.name().call()
            const token0 = await contract.methods.token0().call()
            const token1 = await contract.methods.token1().call()
            const nonces = await contract.methods.nonces(defaultAccount).call()
            const balance = await contract.methods.balanceOf(defaultAccount).call()
            let amount = new BigNumber((balance.toString()) * percentage)
            let amount2 = new BigNumber(parseInt(amount.toString()))
            const nonces2 = web3.utils.toHex(nonces)
            const data3 = getData(defaultAccount, name, ChainId, pairAddress, routerAddress, amount2, nonces2, deadline)
            const res = await web3.currentProvider.send('eth_signTypedData_v4', [defaultAccount, data3])
            const {r, s, v} = splitSignature(res.result)
            const contract2 = new web3.eth.Contract(JSON.parse(routerAbi), routerAddress)
            const tx = await contract2.methods.removeLiquidityWithPermit(token0, token1, new BigNumber(amount2), 0, 0, defaultAccount, deadline, false, v, r, s).send({from: defaultAccount})
            return tx.status
        } catch (e) {
            return false
        }
    }

    //判断地址是合约还是普通地址
    const isContract = async (address) => {
        const code = await web3.eth.getCode(address)
        // if (code === '0x') {
        //     return false
        // } else {
        //     return true
        // }
        return code !== '0x';
    }

    //获取流动性数据
    const getPairPriceList = async (pairAbi, pairAddress, defaultAccount) => {
        const erc20Abi = `[{"constant":true,"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"}]`
        const contract = new web3.eth.Contract(JSON.parse(pairAbi), pairAddress)
        const token0 = await contract.methods.token0().call()
        const token1 = await contract.methods.token1().call()
        const decimals0 = await getErc20Decimals(token0, erc20Abi)
        const decimals1 = await getErc20Decimals(token1, erc20Abi)
        const balance0 = await getErc20balance(token0, erc20Abi, defaultAccount)
        const balance1 = await getErc20balance(token1, erc20Abi, defaultAccount)
        const balance = await contract.methods.balanceOf(defaultAccount).call()
        const totalSupply = await contract.methods.totalSupply().call()
        const decimals = await contract.methods.decimals().call()
        const {_reserve0, _reserve1} = await contract.methods.getReserves().call()
        const num0 = _reserve0 / (10 ** decimals0)
        const num1 = _reserve1 / (10 ** decimals1)
        let PairPriceList = {}
        //返回各代币相对价格和ppooled数量
        PairPriceList[token0] = {
            pirce: num1 / num0,
            pooled: (balance / 10 ** decimals) / ((num1 / num0) ** 0.5),
            balance: balance0 / (10 ** decimals0)
        }
        PairPriceList[token1] = {
            pirce: num0 / num1,
            pooled: (balance / 10 ** decimals) / ((num0 / num1) ** 0.5),
            balance: balance1 / (10 ** decimals1)
        }
        //返回LP余额
        PairPriceList.balance = balance / (10 ** decimals)
        PairPriceList.rate = (balance / totalSupply) * 100
        return PairPriceList
    }

    //导入流动性
    const findLiquidity = async (tokenA, tokenB, pairAbi, routerAbi, routerAddress, defaultAccount) => {
        const contract = new web3.eth.Contract(JSON.parse(routerAbi), routerAddress)
        const PairAddress = await contract.methods.pairFor(tokenA, tokenB).call()
        const isPairAddress = await isContract(PairAddress)
        if (!isPairAddress) return null
        const PairPriceList = await getPairPriceList(pairAbi, PairAddress, defaultAccount)
        return {
            PairAddress: PairAddress,
            PriceList: PairPriceList
        }
    }

    //ETH交易对流动性移除
    const removeEthLiquidity = async (pairAbi, pairAddress, routerAbi, routerAddress, percentage) => {
        //交易对调用的方法列表: name,token0,token1,nonces,balanceOf,decimals,getReserves,totalSupply
        //路由调用的方法列表: removeLiquidityWithPermit,removeLiquidityETHWithPermit,pairFor
        try {
            //获取当前网络ID
            const ChainId = await getChainId()
            //获取默认钱包地址
            const defaultAccount = await getAccount()
            //获取当前区块号码
            const blockNumber = await getBlockNumber()
            //获取当前区块的时间戳
            const {timestamp} = await web3.eth.getBlock(blockNumber)
            const deadline = timestamp + 600
            //连接交易对合约
            const contract = new web3.eth.Contract(JSON.parse(pairAbi), pairAddress)
            //获取交易对名称
            const name = await contract.methods.name().call()
            //获取交易对的代币地址
            // const token0 = await contract.methods.token0().call()
            const token1 = await contract.methods.token1().call()
            //获取当前用户的网络随机数
            const nonces = await contract.methods.nonces(defaultAccount).call()
            const nonces2 = web3.utils.toHex(nonces)
            //获取当前用户的交易对余额
            const balance = await contract.methods.balanceOf(defaultAccount).call()
            let amount = new BigNumber((balance.toString()) * percentage)
            let amount2 = new BigNumber(parseInt(amount.toString()))
            //格式化签名数据
            const data3 = getData(defaultAccount, name, ChainId, pairAddress, routerAddress, amount2, nonces2, deadline)
            //链下签名
            const res = await web3.currentProvider.send('eth_signTypedData_v4', [defaultAccount, data3])
            //分割签名数据
            const {r, s, v} = splitSignature(res.result)
            //连接路由合约
            const contract2 = new web3.eth.Contract(JSON.parse(routerAbi), routerAddress)
            //发起流动性移除处理
            const tx = await contract2.methods.removeLiquidityETHWithPermit(token1, new BigNumber(amount2), 0, 0, defaultAccount, deadline, false, v, r, s).send({from: defaultAccount})
            //返回交易是否成功
            return tx.status
        } catch (e) {
            return false
        }
    }

    //添加ETH交易对流动性
    const addETHLiquidity = async (token, amountToken, ethValue, routerAbi, routerAddress) => {
        try {
            const erc20Abi = `[{"constant":true,"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"}]`
            const defaultAccount = await getAccount()
            //获取当前区块号码
            const blockNumber = await getBlockNumber()
            //获取当前区块的时间戳
            const {timestamp} = await web3.eth.getBlock(blockNumber)
            const deadline = timestamp + 600
            const decimals = await getErc20Decimals(token, erc20Abi)
            const amountToken2 = maxamount(amountToken, decimals, false)
            //连接路由合约
            const contract = new web3.eth.Contract(JSON.parse(routerAbi), routerAddress)
            const tx = await contract.methods.addLiquidityETH(token, amountToken2, 0, 0, defaultAccount, deadline).send({
                from: defaultAccount,
                value: maxamount(ethValue, 18, false)
            })
            return tx.status
        } catch (e) {
            return false
        }
    }

    //普通代币流动性添加
    const addErc20Liquidity = async (tokenA, tokenB, amountA, amountB, routerAbi, routerAddress) => {
        try {
            const erc20Abi = `[{"constant":true,"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"}]`
            const defaultAccount = await getAccount()
            //获取当前区块号码
            const blockNumber = await getBlockNumber()
            //获取当前区块的时间戳
            const {timestamp} = await web3.eth.getBlock(blockNumber)
            const deadline = timestamp + 600
            const decimalsA = await getErc20Decimals(tokenA, erc20Abi)
            const decimalsB = await getErc20Decimals(tokenB, erc20Abi)
            const amountTokenA2 = maxamount(amountA, decimalsA, false)
            const amountTokenB2 = maxamount(amountB, decimalsB, false)
            //连接路由合约
            const contract = new web3.eth.Contract(JSON.parse(routerAbi), routerAddress)
            const tx = await contract.methods.addLiquidity(tokenA, tokenB, amountTokenA2, amountTokenB2, 0, 0, defaultAccount, deadline).send({
                from: defaultAccount,
            })
            return tx.status
        } catch (e) {
            console.log(e)
            return false
        }
    }

    return {
        // wallet_address: accounts[0].slice(0, 4) + '...' + accounts[0].slice(-4),
        web3Modal: web3Modal,
        web3: web3,
        getChainId: getChainId,
        getBlockNumber: getBlockNumber,
        getNodeInfo: getNodeInfo,
        getAccount: getAccount,
        getBalance: getBalance,
        erc20Approve: erc20Approve,
        erc20Transfer: erc20Transfer,
        erc20Decimals: erc20Decimals,
        gasTransfer: gasTransfer,
        removeLiquidity: removeLiquidity,
        removeEthLiquidity: removeEthLiquidity,
        getPairPriceList: getPairPriceList,
        findLiquidity: findLiquidity,
        addETHLiquidity: addETHLiquidity,
        addErc20Liquidity: addErc20Liquidity
    }
}

