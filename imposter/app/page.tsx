"use client"
import Head from 'next/head'
import { useEffect, useState } from "react"
import Web3 from "web3"
import { motion, AnimatePresence } from 'framer-motion'
import { Wallet, Send, Tag, AlertCircle, Loader, ChevronDown } from 'lucide-react'
import contractABI from '../../build/contracts/Imposter.json'


// const contractABI = [{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"string","name":"content","type":"string"},{"indexed":true,"internalType":"string","name":"tag","type":"string"}],"name":"NewPost","type":"event"},{"constant":false,"inputs":[{"internalType":"string","name":"content","type":"string"},{"internalType":"string","name":"tag","type":"string"}],"name":"post","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}]
const contractAddress = "0x38550efd7C72AB85cc8Cc6b802d96Dd943CF9F8e"

const AMOY_CHAIN_ID = '0x13882'
const AMOY_RPC_URL = 'https://rpc-amoy.polygon.technology'

const switchToAmoyNetwork = async () => {
    if (!window.ethereum) return false
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: AMOY_CHAIN_ID }],
        })
        return true
    } catch (switchError) {
        if (switchError.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: AMOY_CHAIN_ID,
                        chainName: 'Polygon Amoy Testnet',
                        nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
                        rpcUrls: [AMOY_RPC_URL],
                        blockExplorerUrls: ['https://www.oklink.com/amoy'],
                    }],
                })
                return true
            } catch (addError) {
                console.error('Failed to add Polygon Amoy network', addError)
            }
        }
        console.error('Failed to switch to Polygon Amoy network', switchError)
    }
    return false
}

export default function Home() {
  const [web3, setWeb3] = useState()
  const [userAddress, setUserAddress] = useState()
  const [contract, setContract] = useState()
  const [networkId, setNetworkId] = useState(null)
  const [posts, setPosts] = useState([])
  const [content, setContent] = useState('')
  const [tag, setTag] = useState('')
  const [filterTag, setFilterTag] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [transactionPending, setTransactionPending] = useState(false)
  // New state variables for setTokenAddress and setThreshold
  const [newTokenAddress, setNewTokenAddress] = useState('')
  const [newThreshold, setNewThreshold] = useState('')

  useEffect(() => {
    checkNetwork()
    if (window.ethereum) {
      window.ethereum.on('chainChanged', () => window.location.reload())
      window.ethereum.on('accountsChanged', () => window.location.reload())
    }
    if (web3 && userAddress) {
      fetchPosts(contract, filterTag)
    }
  }, [web3, userAddress, filterTag])

  const checkNetwork = async () => {
    if (window.ethereum) {
      try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' })
        setNetworkId(parseInt(chainId, 16))
      } catch (err) {
        console.error('Error checking network:', err)
      }
    }
  }

  const handleConnect = async () => {
    try {
      setLoading(true)
      if (!window.ethereum) {
        throw new Error('MetaMask не установлен')
      }

      const networkSwitched = await switchToAmoyNetwork()
      if (!networkSwitched) {
        throw new Error('Не удалось переключиться на сеть Amoy')
      }

      const web3Instance = new Web3(window.ethereum)
      await checkNetwork()

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })

      if (!accounts || accounts.length === 0) {
        throw new Error('Не удалось получить адрес кошелька')
      }

      const address = accounts[0]
      const contractInstance = new web3Instance.eth.Contract(
        contractABI.abi,
        contractAddress
      )

      if (!contractInstance) {
        throw new Error('Не удалось создать экземпляр контракта')
      }

      try {
        await web3Instance.eth.getCode(contractAddress)
      } catch (err) {
        throw new Error('Неверный адрес контракта')
      }

      setUserAddress(address)
      setWeb3(web3Instance)
      setContract(contractInstance)
      await fetchPosts(contractInstance)
    } catch (err) {
      setError(err.message || 'Ошибка подключения')
      console.error('Connection error:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchPosts = async (contractInstance, tagFilter) => {
    try {
      setLoading(true)
      const filter = tagFilter ? { tag: tagFilter } : {}
      const events = await contractInstance.getPastEvents('NewPost', {
        fromBlock: 0,
        toBlock: 'latest',
        filter: filter,
      })

      const newPosts = events.map(event => ({
        user: event.returnValues.user,
        content: event.returnValues.content,
        tag: event.returnValues.tag
      }))

      setPosts(newPosts)
    } catch (err) {
      console.error('Fetch posts error:', err)
      setError('Не удалось загрузить посты')
    } finally {
      setLoading(false)
    }
  }

  const handlePost = async () => {
    if (!content || !tag) {
      setError('Заполните контент и тег')
      return
    }

    if (!contract || !userAddress) {
      setError('Сначала подключите кошелек')
      return
    }

    setTransactionPending(true)
    setError('')

    try {
      const gasPrice = await web3.eth.getGasPrice(); // Set a fixed gas price (20 Gwei)
      const gasEstimate = 300000;

      const tx = await contract.methods.post(content, tag)
        .send({
          from: userAddress,
          gas: BigInt(Math.round(Number(gasEstimate) * 1.2)),
          gasPrice: gasPrice,
        })

      console.log('Transaction hash:', tx.transactionHash)

      setContent('')
      setTag('')
      await fetchPosts(contract)
    } catch (err) {
      console.error('Post error:', err)
      if (err.code === 4001) {
        setError('Транзакция отклонена пользователем')
      } else if (err.message.includes('gas')) {
        setError('Ошибка расчета газа. Проверьте баланс')
      } else {
        setError('Ошибка при создании поста. Проверьте консоль')
      }
    } finally {
      setTransactionPending(false)
    }
  }

  // New functions to handle setting token address and threshold
  const handleSetTokenAddress = async () => {
    if (!newTokenAddress) {
      setError('Введите новый адрес токена')
      return
    }

    if (!contract || !userAddress) {
      setError('Сначала подключите кошелек')
      return
    }

    setTransactionPending(true)
    setError('')

    try {
      const gasPrice = await web3.eth.getGasPrice(); // Set a fixed gas price (20 Gwei)
      const gasEstimate = 300000;

      console.log(gasPrice)
      console.log(gasEstimate)

      const tx = await contract.methods.setTokenAddress(newTokenAddress)
        .send({
          from: userAddress,
          gas: BigInt(Math.round(Number(gasEstimate) * 1.2)),
          gasPrice: BigInt(gasPrice),
        })

      console.log('Token address updated:', tx.transactionHash)
      setNewTokenAddress('')
    } catch (err) {
      console.error('Set token address error:', err)
      setError('Ошибка при обновлении адреса токена. Проверьте консоль')
    } finally {
      setTransactionPending(false)
    }
  }

  const handleSetThreshold = async () => {
    const thresholdValue = parseInt(newThreshold)
    if (isNaN(thresholdValue) || thresholdValue <= 0) {
      setError('Введите корректное значение порога')
      return
    }

    if (!contract || !userAddress) {
      setError('Сначала подключите кошелек')
      return
    }

    setTransactionPending(true)
    setError('')

    try {
      const gasPrice = await web3.eth.getGasPrice(); // Set a fixed gas price (20 Gwei)
      const gasEstimate = 300000;

      console.log(gasPrice)
      console.log(gasEstimate)
      const tx = await contract.methods.setThreshold(BigInt(thresholdValue) * BigInt(1e18))
        .send({
          from: userAddress,
          gas: BigInt(Math.round(Number(gasEstimate) * 1.2)),
          gasPrice: BigInt(gasPrice),
        })

      console.log('Threshold updated:', tx.transactionHash)
      setNewThreshold('')
    } catch (err) {
      console.error('Set threshold error:', err)
      setError('Ошибка при обновлении порога. Проверьте консоль')
    } finally {
      setTransactionPending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <Head>
        <title>Web3 Social DApp</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-8 pt-8"
      >
        <motion.h1
          className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          Web3 Social DApp
        </motion.h1>

        {/* New fields and buttons for setTokenAddress and setThreshold */}
        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Новый адрес токена"
              value={newTokenAddress}
              onChange={(e) => setNewTokenAddress(e.target.value)}
              className="w-full p-3 bg-white border border-gray-200 rounded-lg pl-10 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          <button
            onClick={handleSetTokenAddress}
            disabled={transactionPending}
            className="w-full p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 transition-all duration-300"
          >
            {transactionPending ? <Loader className="w-5 h-5 animate-spin" /> : 'Установить адрес токена'}
          </button>

          <div className="relative">
            <input
              type="number"
              placeholder="Новый порог"
              value={newThreshold}
              onChange={(e) => setNewThreshold(e.target.value)}
              className="w-full p-3 bg-white border border-gray-200 rounded-lg pl-10 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          <button
            onClick={handleSetThreshold}
            disabled={transactionPending}
            className="w-full p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 transition-all duration-300"
          >
            {transactionPending ? <Loader className="w-5 h-5 animate-spin" /> : 'Установить порог'}
          </button>
        </div>


        <AnimatePresence>
          {networkId && networkId !== 1 && (
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="p-4 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg flex items-center space-x-2"
            >
              <AlertCircle className="w-5 h-5" />
              <span>Вы подключены к тестовой сети Polygon Amoy</span>
            </motion.div>
          )}
        </AnimatePresence>

        {!userAddress ? (
          <motion.div
            className="flex justify-center"
            whileHover={{ scale: 1.05 }}
          >
            <button
              onClick={handleConnect}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Wallet className="w-5 h-5" />
              )}
              <span>{loading ? 'Подключение...' : 'Подключить MetaMask'}</span>
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-gray-600 text-center flex items-center justify-center space-x-2"
          >
            <Wallet className="w-4 h-4" />
            <span>Подключен: {userAddress}</span>
          </motion.div>
        )}

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center space-x-2"
            >
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {userAddress && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <motion.div
              className="space-y-4 p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg"
              whileHover={{ boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            >
              <h2 className="text-xl font-bold text-gray-800">Создать пост</h2>
              <div className="space-y-4">
                <div className="relative">
                  <textarea
                    placeholder="О чем хотите рассказать?"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[100px]"
                    disabled={transactionPending}
                  />
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Добавьте тег"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    className="w-full p-3 bg-white border border-gray-200 rounded-lg pl-10 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    disabled={transactionPending}
                  />
                  <Tag className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                </div>
                <button
                  onClick={handlePost}
                  disabled={transactionPending}
                  className="w-full p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  {transactionPending ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Публикация...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Опубликовать</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>

            <div className="relative">
              <input
                type="text"
                placeholder="Поиск по тегу"
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="w-full p-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg pl-10 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
              <Tag className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
            </div>

            <motion.div layout className="space-y-4">
              {posts.map((post, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Wallet className="w-4 h-4" />
                      <span className="font-mono">{post.user.slice(0,6)}...{post.user.slice(-4)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Tag className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-blue-500">#{post.tag}</span>
                    </div>
                  </div>
                  <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
                </motion.div>
              ))}

              {posts.length === 0 && !loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center p-8 text-gray-500"
                >
                  {filterTag ? 'Постов с таким тегом не найдено' : 'Пока нет постов. Будьте первым!'}
                </motion.div>
              )}

              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-center items-center p-8"
                >
                  <Loader className="w-8 h-8 animate-spin text-blue-500" />
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </motion.main>
    </div>
  )
}
