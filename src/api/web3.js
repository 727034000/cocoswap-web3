import Web3 from 'web3'
import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'
import BigNumber from 'bignumber.js'
import {splitSignature} from '@ethersproject/bytes'
import * as k from './tokenlist.json'
import qs from 'qs'
import axios from "axios";
import lodash from 'lodash'

export const swapRate = 0.99
export const REACT_APP_RPC_URL = JSON.parse(process.env["REACT_APP_RPC_URL"])
export const REACT_APP_ERC20TOKEN_ABI = JSON.parse(process.env["REACT_APP_ERC20TOKEN_ABI"])
export const REACT_APP_PAIR_ABI = JSON.parse(process.env["REACT_APP_PAIR_ABI"])
export const REACT_APP_ROUTER_ABI = JSON.parse(process.env["REACT_APP_ROUTER_ABI"])
export const REACT_APP_ETH_ADDRESS = JSON.parse(process.env["REACT_APP_ETH_ADDRESS"])


Object.defineProperty(Array.prototype, 'max', {
    writable: false,
    enumerable: false,
    configurable: true,
    value: function () {
        return Math.max.apply(null, this);
    }
})

Object.defineProperty(Array.prototype, 'min', {
    writable: false,
    enumerable: false,
    configurable: true,
    value: function () {
        return Math.min.apply(null, this);
    }
})


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
    //const defaultToken = ['0xa71edc38d189767582c38a3145b5873052c3e47a', '0x5545153ccfca01fbd7dd11c0b23ba694d9509a6f']
    const defaultToken = ['0xa71edc38d189767582c38a3145b5873052c3e47a']
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
                rpc: REACT_APP_RPC_URL
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

    const getDeadline = async () => {
        const blockNumber = await getBlockNumber()
        const {timestamp} = await web3.eth.getBlock(blockNumber)
        return timestamp + 600
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

    //代币授权给合约
    const erc20Approve = async (tokenAddress, spender, amount) => {
        const defaultAccount = await getAccount()
        const contract = new web3.eth.Contract(REACT_APP_ERC20TOKEN_ABI, tokenAddress)
        const decimals = await contract.methods.decimals().call()
        try {
            const tx = await contract.methods.approve(spender, maxamount(amount, decimals, false)).send({from: defaultAccount})
            return tx.status
        } catch (e) {
            return false
        }
    }

    //获取用户授权代币给其它地址的额度
    const getErc20Allowance = async (tokenAddress, defaultAccount, spender) => {
        const contract = new web3.eth.Contract(REACT_APP_ERC20TOKEN_ABI, tokenAddress)
        const tx = await contract.methods.allowance(defaultAccount, spender).call()
        return tx
    }

    //获取代币的精度
    const getErc20Decimals = async (tokenAddress) => {
        const contract = new web3.eth.Contract(REACT_APP_ERC20TOKEN_ABI, tokenAddress)
        return await contract.methods.decimals().call()
        //return decimals
    }

    //获取用户代币余额
    const getErc20balance = async (tokenAddress, defaultAccount) => {
        const contract = new web3.eth.Contract(REACT_APP_ERC20TOKEN_ABI, tokenAddress)
        return await contract.methods.balanceOf(defaultAccount).call()
        //return balance
    }

    //转账普通代币
    const erc20Transfer = async (tokenAddress, recipient, amount) => {
        const defaultAccount = await getAccount()
        const contract = new web3.eth.Contract(REACT_APP_ERC20TOKEN_ABI, tokenAddress)
        const decimals = await contract.methods.decimals().call()
        try {
            const tx = await contract.methods.transfer(recipient, maxamount(amount, decimals, false)).send({from: defaultAccount})
            return tx.status
        } catch (e) {
            return false
        }
    }

    //转账eth
    const gasTransfer = async (recipient, amount) => {
        const defaultAccount = await getAccount()
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
    const removeLiquidity = async (pairAddress, routerAddress, percentage) => {
        //交易对调用的方法列表: name,token0,token1,nonces,balanceOf,decimals,getReserves,totalSupply
        //路由调用的方法列表: removeLiquidityWithPermit,removeLiquidityETHWithPermit
        try {
            const ChainId = await getChainId()
            const defaultAccount = await getAccount()
            const blockNumber = await getBlockNumber()
            const {timestamp} = await web3.eth.getBlock(blockNumber)
            const deadline = timestamp + 600
            const contract = new web3.eth.Contract(REACT_APP_PAIR_ABI, pairAddress)
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
            const contract2 = new web3.eth.Contract(REACT_APP_ROUTER_ABI, routerAddress)
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
    const getPairPriceList = async (pairAddress, defaultAccount) => {
        const contract = new web3.eth.Contract(REACT_APP_PAIR_ABI, pairAddress)
        const balance = await contract.methods.balanceOf(defaultAccount).call()
        const token0 = await contract.methods.token0().call()
        const token1 = await contract.methods.token1().call()
        const decimals0 = await getErc20Decimals(token0)
        const decimals1 = await getErc20Decimals(token1)
        const balance0 = await getErc20balance(token0, defaultAccount)
        const balance1 = await getErc20balance(token1, defaultAccount)
        const totalSupply = await contract.methods.totalSupply().call()
        const decimals = await contract.methods.decimals().call()
        const {_reserve0, _reserve1} = await contract.methods.getReserves().call()
        const num0 = _reserve0 / (10 ** decimals0)
        const num1 = _reserve1 / (10 ** decimals1)
        let PairPriceList = {}
        //返回各代币相对价格和ppooled数量
        PairPriceList[token0] = {
            decimals: decimals0,
            pirce: num1 / num0,
            pooled: (balance / 10 ** decimals) / ((num1 / num0) ** 0.5),
            balance: balance0 / (10 ** decimals0),
            reserve: _reserve0
        }
        PairPriceList[token1] = {
            decimals: decimals1,
            pirce: num0 / num1,
            pooled: (balance / 10 ** decimals) / ((num0 / num1) ** 0.5),
            balance: balance1 / (10 ** decimals1),
            reserve: _reserve1
        }
        //返回LP余额
        PairPriceList.balance = balance / (10 ** decimals)
        PairPriceList.rate = (balance / totalSupply) * 100
        PairPriceList.token0 = token0
        PairPriceList.token1 = token1
        return PairPriceList
    }

    //导入流动性
    const findLiquidity = async (tokenA, tokenB, routerAddress, defaultAccount) => {
        const contract = new web3.eth.Contract(REACT_APP_ROUTER_ABI, routerAddress)
        const PairAddress = await contract.methods.pairFor(tokenA, tokenB).call()
        console.log(PairAddress)
        const isPairAddress = await isContract(PairAddress)
        if (!isPairAddress) return 'bad'
        const PairPriceList = await getPairPriceList(PairAddress, defaultAccount)
        if (PairPriceList === 'bad') {
            return 'bad'
        }
        return {
            PairAddress: PairAddress,
            PriceList: PairPriceList
        }
    }


    // const MultiFindLiquidity = async (pairAbi, routerAbi, routerAddress, defaultAccount) => {
    //     const tokenlist = getPairList()
    //     const PairList = []
    //     for (let k in tokenlist) {
    //         let tokenA = tokenlist[k][0]
    //         let tokenB = tokenlist[k][1]
    //         const contract = new web3.eth.Contract(JSON.parse(routerAbi), routerAddress)
    //         const PairAddress = await contract.methods.pairFor(tokenA, tokenB).call()
    //         const isPairAddress = await isContract(PairAddress)
    //         if (isPairAddress) {
    //             const PairPriceList = await getPairPriceList(pairAbi, PairAddress, defaultAccount)
    //             console.log(PairPriceList)
    //             PairList.push(PairPriceList)
    //         }
    //     }
    //     return PairList
    // }

    //ETH交易对流动性移除
    const removeEthLiquidity = async (pairAddress, routerAddress, percentage) => {
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
            const contract = new web3.eth.Contract(REACT_APP_PAIR_ABI, pairAddress)
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
            const contract2 = new web3.eth.Contract(REACT_APP_ROUTER_ABI, routerAddress)
            //发起流动性移除处理
            const tx = await contract2.methods.removeLiquidityETHWithPermit(token1, new BigNumber(amount2), 0, 0, defaultAccount, deadline, false, v, r, s).send({from: defaultAccount})
            //返回交易是否成功
            return tx.status
        } catch (e) {
            return false
        }
    }

    //添加ETH交易对流动性
    const addETHLiquidity = async (token, amountToken, ethValue, routerAddress) => {
        try {
            const ChainId = await getChainId()
            const defaultAccount = await getAccount()
            //获取当前区块号码
            const blockNumber = await getBlockNumber()
            //获取当前区块的时间戳
            const {timestamp} = await web3.eth.getBlock(blockNumber)
            const deadline = timestamp + 600
            const decimals = await getErc20Decimals(token)
            const ethDecimals = await getErc20Decimals(REACT_APP_ETH_ADDRESS[ChainId])
            const amountToken2 = maxamount(amountToken, decimals, false)
            //连接路由合约
            const contract = new web3.eth.Contract(REACT_APP_ROUTER_ABI, routerAddress)
            const tx = await contract.methods.addLiquidityETH(token, amountToken2, 0, 0, defaultAccount, deadline).send({
                from: defaultAccount,
                value: maxamount(ethValue, ethDecimals, false)
            })
            return tx.status
        } catch (e) {
            return false
        }
    }

    //普通代币流动性添加
    const addErc20Liquidity = async (tokenA, tokenB, amountA, amountB, routerAddress) => {
        try {
            const defaultAccount = await getAccount()
            //获取当前区块号码
            const deadline = await getDeadline()
            const decimalsA = await getErc20Decimals(tokenA)
            const decimalsB = await getErc20Decimals(tokenB)
            const amountTokenA2 = maxamount(amountA, decimalsA, false)
            const amountTokenB2 = maxamount(amountB, decimalsB, false)
            //连接路由合约
            const contract = new web3.eth.Contract(REACT_APP_ROUTER_ABI, routerAddress)
            const tx = await contract.methods.addLiquidity(tokenA, tokenB, amountTokenA2, amountTokenB2, 0, 0, defaultAccount, deadline).send({
                from: defaultAccount,
            })
            return tx.status
        } catch (e) {
            console.log(e)
            return false
        }
    }

    //科学计数法转为string
    function scientificNotationToString(param) {
        let strParam = String(param)
        let flag = /e/.test(strParam)
        if (!flag) return param

        // 指数符号 true: 正，false: 负
        let sysbol = true
        if (/e-/.test(strParam)) {
            sysbol = false
        }
        // 指数
        let index = Number(strParam.match(/\d+$/)[0])
        // 基数
        let basis = strParam.match(/^[\d\.]+/)[0].replace(/\./, '')

        if (sysbol) {
            return basis.padEnd(index + 1, 0)
        } else {
            return basis.padStart(index + basis.length, 0).replace(/^0/, '0.')
        }
    }

    //避免科学计数法
    function changeNum(num) {
        num = (num - 0).toLocaleString();
        num = num.toString().replace(/\$|\,/g, '');
        return num
    }

    const getPairInfo = async (tokenA, tokenB, routerAddress) => {
        const contract0 = new web3.eth.Contract(REACT_APP_ROUTER_ABI, routerAddress)
        const PairAddress = await contract0.methods.pairFor(tokenA, tokenB).call()
        const contract = new web3.eth.Contract(REACT_APP_PAIR_ABI, PairAddress)
        const token0 = await contract.methods.token0().call()
        const token1 = await contract.methods.token1().call()
        const decimals0 = await getErc20Decimals(token0, REACT_APP_ERC20TOKEN_ABI)
        const decimals1 = await getErc20Decimals(token1, REACT_APP_ERC20TOKEN_ABI)
        const {_reserve0, _reserve1} = await contract.methods.getReserves().call()
        let PairPriceList = {}
        //返回各代币相对价格和ppooled数量
        PairPriceList[token0] = {
            decimals: decimals0,
            reserve: _reserve0
        }
        PairPriceList[token1] = {
            decimals: decimals1,
            reserve: _reserve1
        }
        PairPriceList.PairAddress = PairAddress
        return PairPriceList
    }

    //普通代币交易对直接兑换
    const swapTokensForTokens = async (fromTokenAddress, toTokenAddress, fromAmount, slippage, routerAddress) => {
        try {
            const defaultAccount = await getAccount()
            const PriceList = await getPairInfo(fromTokenAddress, toTokenAddress, routerAddress)
            //console.log(PriceList)
            const fromAmount2 = maxamount(fromAmount, PriceList[web3.utils.toChecksumAddress(fromTokenAddress)]['decimals'], false)
            console.log('fromAmount2', fromAmount2.toString() / 10 ** 18)
            const toAmount = fromAmount2.toString() * (PriceList[web3.utils.toChecksumAddress(toTokenAddress)]['reserve']) / (PriceList[web3.utils.toChecksumAddress(fromTokenAddress)]['reserve'])
            const toAmount2 = new BigNumber(toAmount - (slippage / 100) * toAmount)
            console.log('toAmount2', toAmount2.toString() / 10 ** 18)
            const deadline = await getDeadline()
            const contract = new web3.eth.Contract(REACT_APP_ROUTER_ABI, routerAddress)
            //console.log('contract',contract)
            const tx = await contract.methods.swapExactTokensForTokens(fromAmount2, toAmount2, [fromTokenAddress, toTokenAddress], defaultAccount, deadline).send({from: defaultAccount})
            console.log(tx)
            return tx.status
        } catch (e) {
            console.log(e)
            return false
        }
    }

    //普通代币兑换ETH,,无中间路径
    const swapTokenForETH = async (fromTokenAddress, fromAmount, slippage, routerAddress) => {
        try {
            const defaultAccount = await getAccount()
            const ChainId = await getChainId()
            const toTokenAddress = REACT_APP_ETH_ADDRESS[ChainId]
            const PriceList = await getPairInfo(fromTokenAddress, toTokenAddress, routerAddress)
            const fromAmount2 = maxamount(fromAmount, PriceList[web3.utils.toChecksumAddress(fromTokenAddress)]['decimals'], false)
            console.log(fromAmount2.toString())
            const toAmount = fromAmount2.toString() * (PriceList[web3.utils.toChecksumAddress(toTokenAddress)]['reserve']) / (PriceList[web3.utils.toChecksumAddress(fromTokenAddress)]['reserve'])
            ///const toAmount2 = new BigNumber(toAmount - (slippage / 100) * toAmount)
            const toAmount2 = new BigNumber(parseInt((new BigNumber(toAmount - (slippage / 100) * toAmount)).toString()))
            console.log(toAmount2.toString())
            const deadline = await getDeadline()
            const contract = new web3.eth.Contract(REACT_APP_ROUTER_ABI, routerAddress)
            const tx = await contract.methods.swapExactTokensForETH(fromAmount2, toAmount2, [fromTokenAddress, toTokenAddress], defaultAccount, deadline).send({from: defaultAccount})
            return tx.status
        } catch (e) {
            console.log(e)
            return false
        }
    }

    //普通代币兑换ETH,无中间路径
    const swapETHForToken = async (toTokenAddress, fromAmount, slippage, routerAddress) => {
        try {
            const defaultAccount = await getAccount()
            const ChainId = await getChainId()
            const fromTokenAddress = REACT_APP_ETH_ADDRESS[ChainId]
            const PriceList = await getPairInfo(fromTokenAddress, toTokenAddress, routerAddress)
            const fromAmount2 = maxamount(fromAmount, PriceList[web3.utils.toChecksumAddress(fromTokenAddress)]['decimals'], false)
            const toAmount = fromAmount2.toString() * (PriceList[web3.utils.toChecksumAddress(toTokenAddress)]['reserve']) / (PriceList[web3.utils.toChecksumAddress(fromTokenAddress)]['reserve'])
            // const toAmount2 = new BigNumber(toAmount - (slippage / 100) * toAmount)
            const toAmount2 = new BigNumber(parseInt((new BigNumber(toAmount - (slippage / 100) * toAmount)).toString()))
            const deadline = await getDeadline()
            const contract = new web3.eth.Contract(REACT_APP_ROUTER_ABI, routerAddress)
            const tx = await contract.methods.swapExactETHForTokens(toAmount2, [fromTokenAddress, toTokenAddress], defaultAccount, deadline).send({
                from: defaultAccount,
                value: fromAmount2
            })
            return tx.status
        } catch (e) {
            console.log(e)
            return false
        }
    }

    //dodoapi交易
    const dodoApi = async (fromTokenAddress, toTokenAddress, fromAmount, slippage) => {
        const EHT = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
        if (fromTokenAddress === '')
            fromTokenAddress = EHT
        if (toTokenAddress === '')
            toTokenAddress = EHT

        try {
            let fromDecimals, toDecimals
            if (fromTokenAddress === EHT) {
                fromDecimals = 18
            } else {
                fromDecimals = await getErc20Decimals(fromTokenAddress)
            }

            if (toTokenAddress === EHT) {
                toDecimals = 18
            } else {
                toDecimals = await getErc20Decimals(toTokenAddress)
            }

            //const fromDecimals = await getErc20Decimals(fromTokenAddress)
            //const fromDecimals = 18
            //const toDecimals = await getErc20Decimals(toTokenAddress)
            const defaultAccount = await getAccount()
            const deadline = await getDeadline()
            const chainId = await getChainId()
            const rpc = REACT_APP_RPC_URL[chainId]
            const config = {
                fromTokenAddress: fromTokenAddress,
                fromTokenDecimals: fromDecimals,
                toTokenAddress: toTokenAddress,
                toTokenDecimals: toDecimals,
                fromAmount: scientificNotationToString(fromAmount * (10 ** fromDecimals)),
                slippage: slippage,
                userAddr: defaultAccount,
                chainId: chainId,
                rpc: rpc,
                deadLine: deadline,
            }
            const res = await axios.get('https://route-api.dodoex.io/dodoapi/getdodoroute?' + qs.stringify(config))
            if (res.data.status === 200) {
                let res2 = res.data.data
                res2.approvefromAmount = new BigNumber(fromAmount)
                res2.defaultAccount = defaultAccount
                return res2
            } else {
                return {}
            }
        } catch (e) {
            return {}
        }
    }

    const getArrayUnique = (arr) => {
        console.log(arr)
        const arrNew = lodash.uniq(arr)
        console.log(arr, arrNew, arr.length, arrNew.length)
        return arr.length === arrNew.length
    }
    //获取兑换路径列表
    const getSwapPath = (swapList, MiddlePathList) => {
        let OneMiddlePath = []
        let TwoMiddlePath = []
        let ThreeMiddlePath = []
        let FourMiddlePath = []
        for (let i in MiddlePathList) {
            OneMiddlePath.push([swapList[0], MiddlePathList[i], swapList[1]])
        }
        for (let i in MiddlePathList) {
            for (let j in MiddlePathList) {
                if (getArrayUnique([MiddlePathList[i], MiddlePathList[j]])) {
                    TwoMiddlePath.push([swapList[0], MiddlePathList[i], MiddlePathList[j], swapList[1]])
                }
            }
        }

        for (let i in MiddlePathList) {
            for (let j in MiddlePathList) {
                for (let k in MiddlePathList) {
                    if (getArrayUnique([MiddlePathList[i], MiddlePathList[j], MiddlePathList[k]])) {
                        ThreeMiddlePath.push([swapList[0], MiddlePathList[i], MiddlePathList[j], MiddlePathList[k], swapList[1]])
                    }
                }
            }
        }

        for (let i in MiddlePathList) {
            for (let j in MiddlePathList) {
                for (let k in MiddlePathList) {
                    for (let l in MiddlePathList) {
                        if (getArrayUnique([MiddlePathList[i], MiddlePathList[j], MiddlePathList[k], MiddlePathList[l]])) {
                            FourMiddlePath.push([swapList[0], MiddlePathList[i], MiddlePathList[j], MiddlePathList[k], MiddlePathList[l], swapList[1]])
                        }
                    }
                }
            }
        }

        let list_new = {
            NoMiddlePath: [swapList],
            OneMiddlePath: OneMiddlePath,
            TwoMiddlePath: TwoMiddlePath,
            ThreeMiddlePath: ThreeMiddlePath,
            FourMiddlePath: FourMiddlePath
        }
        console.log(list_new)
        return list_new
    }

    /**
     * 无中间兑换路径
     const list = [fromToken,toToken]
     **/
    const getNoMiddlePathPrice = async (list, RouterAddress) => {
        try {
            const m1 = await getPairInfo(list[0], list[1], RouterAddress)
            let n1 = (m1[list[0]]['reserve']) / (m1[list[1]]['reserve'])
            return {price: n1, path: list}
        } catch (e) {
            return {price: 0, path: null};
        }
    }

    /**
     * 一个中间兑换路径
     const list = [fromToken,middleToken,toToken]
     **/
    const getOneMiddlePathPrice = async (list, RouterAddress) => {
        try {
            const m1 = await getPairInfo(list[0], list[1], RouterAddress)
            const m2 = await getPairInfo(list[1], list[2], RouterAddress)
            //const m = await getPairInfo(list.fromToken, list.toToken, RouterAddress)
            let n1 = (m1[list[0]]['reserve']) / (m1[list[1]]['reserve'])
            let n2 = (m2[list[1]]['reserve']) / (m2[list[2]]['reserve'])
            return {price: n1 * n2, path: list}
        } catch (e) {
            return {price: 0, path: null}
        }
    }

    /**
     * 两个中间兑换路径
     const list = [fromToken,middleToken1,middleToken2,toToken]
     **/
    const getTwoMiddlePathPrice = async (list, RouterAddress) => {
        try {
            const m1 = await getPairInfo(list[0], list[1], RouterAddress)
            const m2 = await getPairInfo(list[1], list[2], RouterAddress)
            const m3 = await getPairInfo(list[2], list[3], RouterAddress)
            let n1 = (m1[list[0]]['reserve']) / (m1[list[1]]['reserve'])
            let n2 = (m2[list[1]]['reserve']) / (m2[list[2]]['reserve'])
            let n3 = (m3[list[2]]['reserve']) / (m3[list[3]]['reserve'])
            return {price: n1 * n2 * n3, path: list}
        } catch (e) {
            return {price: 0, path: null};
        }
    }

    /**
     * 三个中间兑换路径
     const list = [fromToken,middleToken1,middleToken2,middleToken3,toToken]
     **/
    const getThreeMiddlePathPrice = async (list, RouterAddress) => {
        try {
            const m1 = await getPairInfo(list[0], list[1], RouterAddress)
            const m2 = await getPairInfo(list[1], list[2], RouterAddress)
            const m3 = await getPairInfo(list[2], list[3], RouterAddress)
            const m4 = await getPairInfo(list[3], list[4], RouterAddress)
            let n1 = (m1[list[0]]['reserve']) / (m1[list[1]]['reserve'])
            let n2 = (m2[list[1]]['reserve']) / (m2[list[2]]['reserve'])
            let n3 = (m3[list[2]]['reserve']) / (m3[list[3]]['reserve'])
            let n4 = (m4[list[3]]['reserve']) / (m4[list[4]]['reserve'])
            return {price: n1 * n2 * n3 * n4, path: list}
        } catch (e) {
            return {price: 0, path: null};
        }
    }

    /**
     * 四个中间兑换路径
     const list = [fromToken,middleToken1,middleToken2,middleToken3,middleToken4,toToken]
     **/
    const getFourMiddlePathPrice = async (list, RouterAddress) => {
        try {
            const m1 = await getPairInfo(list[0], list[1], RouterAddress)
            const m2 = await getPairInfo(list[1], list[2], RouterAddress)
            const m3 = await getPairInfo(list[2], list[3], RouterAddress)
            const m4 = await getPairInfo(list[3], list[4], RouterAddress)
            const m5 = await getPairInfo(list[4], list[5], RouterAddress)
            let n1 = (m1[list[0]]['reserve']) / (m1[list[1]]['reserve'])
            let n2 = (m2[list[1]]['reserve']) / (m2[list[2]]['reserve'])
            let n3 = (m3[list[2]]['reserve']) / (m3[list[3]]['reserve'])
            let n4 = (m4[list[3]]['reserve']) / (m4[list[4]]['reserve'])
            let n5 = (m5[list[4]]['reserve']) / (m5[list[5]]['reserve'])
            return {price: n1 * n2 * n3 * n4 * n5 * (swapRate ** 4), path: list}
        } catch (e) {
            return {price: 0, path: null};
        }
    }

    const GetSwapPrice = async (swapList, MiddlePathList, RouterAddress, callback) => {
        const listNew = getSwapPath(swapList, MiddlePathList)
        const listNewCount = listNew.NoMiddlePath.length + listNew.OneMiddlePath.length + listNew.TwoMiddlePath.length + listNew.ThreeMiddlePath.length + listNew.FourMiddlePath.length
        console.log('listNewCount', listNewCount)
        let PriceList = []
        if (listNew.NoMiddlePath.length > 0) {
            for (let i in listNew.NoMiddlePath) {
                getNoMiddlePathPrice(listNew.NoMiddlePath[i], RouterAddress).then(res => {
                    PriceList.push(res)
                    callback(PriceList, listNewCount)
                })

            }
        }
        if (listNew.OneMiddlePath.length > 0) {
            for (let i in listNew.OneMiddlePath) {
                getOneMiddlePathPrice(listNew.OneMiddlePath[i], RouterAddress).then(res => {
                    PriceList.push(res)
                    callback(PriceList, listNewCount)
                })
            }
        }
        if (listNew.TwoMiddlePath.length > 0) {
            for (let i in listNew.TwoMiddlePath) {
                getTwoMiddlePathPrice(listNew.TwoMiddlePath[i], RouterAddress).then(res => {
                    PriceList.push(res)
                    callback(PriceList, listNewCount)
                })
            }
        }

        if (listNew.ThreeMiddlePath.length > 0) {
            for (let i in listNew.ThreeMiddlePath) {
                getThreeMiddlePathPrice(listNew.ThreeMiddlePath[i], RouterAddress).then(res => {
                    PriceList.push(res)
                    callback(PriceList, listNewCount)
                })
            }
        }

        if (listNew.FourMiddlePath.length > 0) {
            for (let i in listNew.FourMiddlePath) {
                getFourMiddlePathPrice(listNew.FourMiddlePath[i], RouterAddress).then(res => {
                    PriceList.push(res)
                    callback(PriceList, listNewCount)
                })
            }
        }
    }

    //获取最佳兑换路径
    const getBestPrcie = async (swapList, MiddlePathList, RouterAddress, callback) => {
        GetSwapPrice(swapList, MiddlePathList, RouterAddress, function (list, listNewCount) {
            const list2 = lodash.sortBy(list, function (it) {
                return it.price
            })
            callback(list2[list2.length - 1])
        })
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
        getDeadline: getDeadline,
        erc20Approve: erc20Approve,
        getErc20Allowance: getErc20Allowance,
        erc20Transfer: erc20Transfer,
        getErc20Decimals: getErc20Decimals,
        getErc20balance: getErc20balance,
        gasTransfer: gasTransfer,
        removeLiquidity: removeLiquidity,
        removeEthLiquidity: removeEthLiquidity,
        getPairInfo: getPairInfo,
        getPairPriceList: getPairPriceList,
        findLiquidity: findLiquidity,
        addETHLiquidity: addETHLiquidity,
        addErc20Liquidity: addErc20Liquidity,
        dodoApi: dodoApi,
        swapTokensForTokens: swapTokensForTokens,
        swapTokenForETH: swapTokenForETH,
        swapETHForToken: swapETHForToken,
        getSwapPath: getSwapPath,
        GetSwapPrice: GetSwapPrice,
        getBestPrcie: getBestPrcie,
        getNoMiddlePathPrice: getNoMiddlePathPrice,
        getOneMiddlePathPrice: getOneMiddlePathPrice,
        getTwoMiddlePathPrice: getTwoMiddlePathPrice,
        getThreeMiddlePathPrice: getThreeMiddlePathPrice,
        getFourMiddlePathPrice: getFourMiddlePathPrice
    }
}

