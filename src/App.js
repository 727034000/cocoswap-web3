import './App.css';
import {
    REACT_APP_ERC20TOKEN_ABI,
    REACT_APP_PAIR_ABI,
    REACT_APP_ROUTER_ABI,
    REACT_APP_ETH_ADDRESS,
    getTokenList,
    getPairList,
    connect, maxamount
} from './api/web3'
import {useEffect, useState} from 'react'
import axios from "axios"
import qs from 'qs'
import lodash from "lodash";

function App() {
    const [userData, setUserDate] = useState([]);
    const [maxprice, setMaxprice] = useState(0);
    const [path, setPath] = useState([]);
    useEffect(() => {
        const fectdata = async () => {
            const time0 = Date.now()
            const connectWeb3 = await connect()
            const time1 = Date.now()
            console.log(time1 - time0)
            const {web3, getAccount, getBlockNumber, getChainId, getBalance, getNodeInfo, getPairPriceList, findLiquidity, removeLiquidity, removeEthLiquidity, erc20Approve, getErc20Allowance, getErc20Decimals, getErc20balance, gasTransfer, erc20Transfer, getPairInfo, addETHLiquidity, addErc20Liquidity, getDeadline, dodoApi, swapTokensForTokens, swapTokenForETH, swapETHForToken, multiChooseSwapPrice, massGetBalance, getInfoList} = connectWeb3
            // const defaultAccount = await getAccount()
            const defaultChainId = await getChainId()
            // const BlockNumber = await getBlockNumber()
            const defaultETH = web3.utils.toChecksumAddress(REACT_APP_ETH_ADDRESS[defaultChainId])
            // console.log(defaultAccount)
            // console.log(defaultChainId)
            // console.log(BlockNumber)
            // console.log(defaultETH)
            // console.log('getBalance', await getBalance(defaultAccount))
            // console.log('getNodeInfo', await getNodeInfo())
            // console.log('getDeadline', await getDeadline())
            // console.log('getErc20Decimals', await getErc20Decimals(defaultETH))
            // console.log('getErc20balance', await getErc20balance(defaultETH, defaultAccount))
            const RouterAddress = web3.utils.toChecksumAddress('0xed7d5f38c79115ca12fe6c0041abb22f0a06c300')
            // console.log('??????????????????',await erc20Approve(defaultETH,RouterAddress,20,defaultAccount))
            // console.log('??????????????????',await getErc20Allowance(defaultETH,defaultAccount,RouterAddress))
            const USDT = web3.utils.toChecksumAddress('0xa71edc38d189767582c38a3145b5873052c3e47a')
            const CHG = web3.utils.toChecksumAddress('0xa6d5a19151ecd3c36c6b84fe1e11aa8fd510962d')
            const TransferTo = web3.utils.toChecksumAddress('0xc1ac5Fd459d2e89BC1B7a11Ea7b89F4c7254093F')
            // console.log('??????????????????',await erc20Transfer(USDT,TransferTo,0.01))
            // console.log('Gas???????????????',await gasTransfer(TransferTo,0.001))
            //console.log('?????????????????????',await findLiquidity(defaultETH,USDT,RouterAddress,defaultAccount))
            const PairAddress = web3.utils.toChecksumAddress('0x499B6E03749B4bAF95F9E70EeD5355b138EA6C31') //HT-USDT
            // console.log('???????????????????????????',await getPairPriceList(PairAddress,defaultAccount))
            // console.log('???????????????????????????????????????', await getPairInfo(defaultETH, USDT,RouterAddress))
            // console.log('??????HT-USDT???????????????',await addETHLiquidity(USDT,0.01,0.01,RouterAddress))
            // console.log('??????CHG????????????',await erc20Approve(CHG,RouterAddress,100))
            // console.log('??????USDT????????????',await erc20Approve(USDT,RouterAddress,100))
            // console.log('??????USDT-CHG???????????????',await addErc20Liquidity(CHG,USDT,100,0.01,RouterAddress))
            const PairAddress2 = web3.utils.toChecksumAddress('0x3844361e0d2fef2839161773920f87849a2cb39c')//CHG-USDT
            // console.log('??????CHG-USDT???????????????',await removeLiquidity(PairAddress2,RouterAddress,0.01))
            // console.log('??????HT-USDT???????????????',await removeEthLiquidity(PairAddress,RouterAddress,0.01))
            // console.log('??????CHG????????????',await erc20Approve(CHG,RouterAddress,100))
            // console.log('??????USDT????????????',await erc20Approve(USDT,RouterAddress,100))
            // console.log('CHG-USDT????????????',await swapTokensForTokens(CHG,USDT,0.1,5,RouterAddress))
            // console.log('USDT-CHG????????????', await swapTokensForTokens(USDT, CHG, 1, 5, RouterAddress))
            // console.log('HT-USDT??????', await swapETHForToken(USDT, 0.01, 5, RouterAddress))
            // console.log('USDT-HT??????', await swapTokenForETH(USDT, 0.01, 5, RouterAddress))
            console.log('??????dodoswap????????????')
            //HT??????USDT,fromAddress?????????
            //const dodoObj = {fromAddress: '', toAddress: USDT, fromAmount: 0.00001, slippage: 5}
            //USDT??????HT,toAddress?????????
            // const dodoObj = {fromAddress: USDT, toAddress: '', fromAmount: 1, slippage: 5}
            // const txDodoApi = await dodoApi(dodoObj.fromAddress, dodoObj.toAddress, dodoObj.fromAmount, dodoObj.slippage)
            // console.log(txDodoApi)
            // if (txDodoApi.data) {
            //     let isApproved
            //     let {targetApproveAddr, data, to} = txDodoApi
            //     if (targetApproveAddr === '') {
            //         isApproved = true
            //     } else {
            //         isApproved = await erc20Approve(dodoObj.fromAddress, targetApproveAddr, dodoObj.fromAmount)
            //     }
            //     if (isApproved) {
            //         let txConfig = {
            //             data: data,
            //             from: defaultAccount,
            //             to: to,
            //         }
            //         if (targetApproveAddr === '') {
            //             txConfig.value = maxamount(dodoObj.fromAmount, 18, false)
            //         }
            //         await web3.eth.sendTransaction(txConfig)
            //     }
            // }
            // console.log('??????dodoswap??????????????????')
            const MDX = web3.utils.toChecksumAddress('0x25D2e80cB6B86881Fd7e07dd263Fb79f4AbE033c')
            //????????????????????????
            const HTMoon = web3.utils.toChecksumAddress('0xb62E3b6a3866f5754FdeFcf82e733310e2851043')
            const HUSD = web3.utils.toChecksumAddress('0x0298c2b32eaE4da002a15f36fdf7615BEa3DA047')
            const BXH = web3.utils.toChecksumAddress('0xcBD6Cb9243d8e3381Fea611EF023e17D1B7AeDF0')
            const HBTC = web3.utils.toChecksumAddress('0x66a79d23e58475d2738179ca52cd0b41d73f0bea')
            let nameList = {}
            nameList[HTMoon] = 'HTMoon'
            nameList[MDX] = 'MDX'
            nameList[USDT] = 'USDT'
            nameList[HUSD] = 'HUSD'
            nameList[defaultETH] = 'ETH'
            nameList[BXH] = 'BXH'
            nameList[HBTC] = 'HBTC'
            // let middlePath = []
            // const txPath = [defaultETH, HUSD]
            // middlePath = [USDT, HUSD, defaultETH,BXH,HBTC]
            // let factoryList = [web3.utils.toChecksumAddress('0xb0b670fc1f7724119963018db0bfa86adb22d941'), web3.utils.toChecksumAddress('0xe0367ec2bd4ba22b1593e4fefcb91d29de6c512a'), web3.utils.toChecksumAddress('0x979efe7ca072b72d6388f415d042951ddf13036e')]
            // multiChooseSwapPrice(factoryList, txPath, middlePath, function (item) {
            //     console.log(item)
            // })
            //????????????????????????
            // massGetBalance(getTokenList(), function (returnList, TokenListCount) {
            //     if (returnList.length === TokenListCount) {
            //         let returnList2
            //         returnList2 = returnList.sort(function (a, b) {
            //             return parseFloat(b.balance) - parseFloat(a.balance)
            //         })
            //         for (let i in returnList2) {
            //             console.log(returnList2[i]['symbol'], returnList2[i]['address'], returnList2[i]['balance'] / (10 ** (returnList2[i]['decimals'])))
            //         }
            //     }
            // })
            //??????????????????????????????
            getInfoList(function (returnArray) {
                console.log(returnArray)
            })


        }
        fectdata()
    }, [])
    return (
        <div className="App">
            <header className="App-header">
                {path}
                web {maxprice}
            </header>
        </div>
    );
}

export default App;
