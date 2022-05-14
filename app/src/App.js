import './App.css';
import {
  useState, useEffect
} from 'react';
import {
  Connection,
  PublicKey
} from '@solana/web3.js';
import {
  Program,
  Provider,
  web3
} from '@project-serum/anchor';
import * as anchor from '@project-serum/anchor';
import idl from './on_chain_twitter_3.json';
import {
  getPhantomWallet
} from '@solana/wallet-adapter-wallets';
import {
  useWallet,
  WalletProvider,
  ConnectionProvider
} from '@solana/wallet-adapter-react';
import {
  WalletModalProvider,
  WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import 'bootstrap/dist/css/bootstrap.css';
import { Button,Col,Row, Form } from 'react-bootstrap';
import { useSnackbar } from "notistack";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid, regular, brands } from '@fortawesome/fontawesome-svg-core/import.macro'; 
import 'react-toastify/dist/ReactToastify.css';  
import { ToastContainer, toast } from 'react-toastify';    

// import { add, from, toString } from '@pacote/u64';
// import { TweetBody } from './components/tweet.js';
// import {PullToRefresh, PullDownContent, ReleaseContent, RefreshContent} from "react-js-pull-to-refresh";
require('@solana/wallet-adapter-react-ui/styles.css');

const wallets = [
  /* view list of available wallets at https://github.com/solana-labs/wallet-adapter#wallets */
  new getPhantomWallet()
]

const {
  SystemProgram,
  Keypair
} = web3;
/* create an account  */
const baseAccount = Keypair.generate();
const opts = {
  preflightCommitment: "processed"
}
const programID = new PublicKey(idl.metadata.address);

function App() {
  const [value, setValue] = useState({
    tweets: [],
    twitterUsers: [],
    gotTweetsUser: false,
    gotTweets: false,
    validated: false,
    isLoading: false,
    functionCalled: false,
    isTweetEditing: false,
    editigTweetAddress: null,
    new_topic: '',
    new_content: ''
  });
  const wallet = useWallet();
  let twitterUsers = [];
  let tweets = [];

  const enqueSnackbar = useSnackbar();

  async function getProvider() {
    /* create the provider and return it to the caller */
    /* network set to local network for now */
    const network = "http://127.0.0.1:8899";
    const connection = new Connection(network, opts.preflightCommitment);

    const provider = new Provider(
      connection, wallet, opts.preflightCommitment,
    );
    return provider;
  }

  async function getTwitterUsers() {
    const provider = await getProvider()
    /* create the program interface combining the idl, program ID, and provider */
    console.log(programID.toBase58());
    const program = new Program(idl, programID, provider);
    twitterUsers = await program.account.twitterUser.all();
    console.log('twitter users accounts: ', twitterUsers);
    if (twitterUsers && twitterUsers.length > 0) {
      setValue({
        twitterUsers: twitterUsers,
        tweets: tweets,
        gotTweetsUser: true,
        functionCalled: true,
        isTweetEditing: false,
        editigTweetAddress: null
      });
    }
  }

  async function getTweets() {
    const provider = await getProvider()
    /* create the program interface combining the idl, program ID, and provider */
    console.log(programID.toBase58());
    const program = new Program(idl, programID, provider);
    tweets = await program.account.tweet.all();
    console.log('tweets accounts: ', tweets);
    if (tweets && tweets.length > 0) {
      setValue({
        twitterUsers: twitterUsers,
        tweets: tweets,
        gotTweets: true,
        functionCalled: true,
        isTweetEditing: false,
        editigTweetAddress: null,
        new_topic: '',
        new_content: ''
      });
    }
  }

  async function getTweetsAndUsers() {
    if(!value.functionCalled) {
      console.log('test');
      getTwitterUsers();
      getTweets();
      setValue({
        functionCalled: true
      });
    }
  }

  // async function testingFn() {
  //   if(!value.functionCalled) {
  //     console.log('test');
  //     getTweetsAndUsers();
  //     setValue({
  //       functionCalled: true,
  //       isTweetEditing: false,
  //       editigTweetAddress: null
  //     });
  //   }
  // };

  getTweetsAndUsers();

  async function handleSubmit(event) {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }
    setValue({
      validated: true,
      functionCalled: true,
      isTweetEditing: false,
      editigTweetAddress: null,
      new_topic: '',
      new_content: ''
    })
  }

  async function sendTweet() {
    const provider = await getProvider()
    /* create the program interface combining the idl, program ID, and provider */
    console.log(programID.toBase58());
    const program = new Program(idl, programID, provider);
    console.log(value.new_content);
    console.log(value.new_topic);
    let topic = document.getElementById('new_topic').value;
    let content = document.getElementById('new_content').value;
    if (topic && topic.length > 0) {
      if (content && content.length > 0) {
        try {
          setValue({
            isLoading: true,
            functionCalled: true,
            isTweetEditing: false,
            editigTweetAddress: null
          });
          const [userPda,userBump] = await PublicKey.findProgramAddress(
            [
              Buffer.from("twitter-user"),
              provider.wallet.publicKey.toBuffer()
            ],
            programID
          );
          const twitterUser = await program.account.twitterUser.fetch(userPda);
          console.log('tweet account: ', twitterUser);
          const new_keypar = web3.Keypair.generate();
          const [pda,bump] = await PublicKey.findProgramAddress(
            [
              anchor.utils.bytes.utf8.encode("tweet-account"),
              provider.wallet.publicKey.toBuffer(),
              new_keypar.publicKey.toBuffer()
            ],
            programID
          );
          const transaction = new web3.Transaction();
          const updateAddress = await program.instruction.updateNextAddress(new_keypar.publicKey, {
            accounts: {
              author: provider.wallet.publicKey,
              twitterUser: userPda,
            }
          });
          const account = await program.instruction.sendTweet(topic, content, {
            accounts: {
              twitterUser: userPda,
              tweet: pda,
              author: provider.wallet.publicKey,
              systemProgram: web3.SystemProgram.programId,
            }
          });
          // transaction.add(
          //   await program.rpc.updateNextAddress(new_keypar.publicKey, {
          //     accounts: {
          //       author: provider.wallet.publicKey,
          //       twitterUser: userPda,
          //     }
          //   }),
          //   await program.rpc.sendTweet(topic, content, {
          //     accounts: {
          //       twitterUser: userPda,
          //       tweet: pda,
          //       author: provider.wallet.publicKey,
          //       systemProgram: web3.SystemProgram.programId,
          //     }
          //   })
          // );
          transaction.add(updateAddress);
          transaction.add(account);
          const network = "http://127.0.0.1:8899";
          const connection = new Connection(network, opts.preflightCommitment);
          const signature = await wallet.sendTransaction(transaction, connection);
          await connection.confirmTransaction(signature, "processed");
          getTweetsAndUsers();
          setValue({
            isLoading: false,
            functionCalled: true
          });
        } catch (err) {
          setValue({
            isLoading: false,
            functionCalled: true,
            isTweetEditing: false,
            editigTweetAddress: null
          });
          console.log("Transaction error: ", err);
        }
      }
      else {
        toast.error("Content cannot be empty", { position: toast.POSITION.TOP_RIGHT })
        // enqueSnackbar('Content cannot be empty', { variant: "error" });
      }
    }
    else {
      toast.error("Topic cannot be empty", { position: toast.POSITION.TOP_RIGHT })
      // enqueSnackbar('Topic cannot be empty', { variant: "error" });
    }
    
  }

  async function justUpdateKey(tweet) {
    console.log(tweet);
    setValue({
      isEditing: true,
      editigTweetAddress: tweet.account.address.toBase58(),
      new_content: tweet.account.content,
      new_topic: tweet.account.topic
    });
  }

  async function updateTweet() {
    const provider = await getProvider()
    /* create the program interface combining the idl, program ID, and provider */
    console.log(programID.toBase58());
    const program = new Program(idl, programID, provider);
    try {
      const [userPda,userBump] = await PublicKey.findProgramAddress(
        [
          Buffer.from("twitter-user"),
          provider.wallet.publicKey.toBuffer()
        ],
        programID
      );
      const twitterUser = await program.account.twitterUser.fetch(userPda);
      console.log('tweet account: ', twitterUser);
      let tweets = await program.account.tweet.all();
      console.log('tweet account: ', tweets);
      // console.log(Uint8Array.from(parseInt(twittercount.toString())));
      const [pda,bump] = await PublicKey.findProgramAddress(
        [
          anchor.utils.bytes.utf8.encode("tweet-account"),
          provider.wallet.publicKey.toBuffer(),
          tweets[0].account.address.toBuffer()
        ],
        programID
      );
      // const [pda,bump] = await PublicKey.findProgramAddress(
      //   [
      //     anchor.utils.bytes.utf8.encode("tweet-account"),
      //     provider.wallet.publicKey.toBuffer(),
      //     tweetAccounts2[0].publicKey.toBuffer()
      //   ],
      //   programID
      // );
      const updateAddress = await program.rpc.updateNextAddress(tweets[0].account.address, {
        accounts: {
          author: provider.wallet.publicKey,
          twitterUser: userPda,
        }
      });
      // const tweets = await program.account.tweet.all();
      // const tweetAccounts = await program.account.tweet.fetch(pda);
      // console.log('tweet account: ', tweets);
      const account = await program.rpc.updateTweet('Edited Tweet。', 'First/Second tweet through bloackchain', {
        accounts: {
          twitterUser: userPda,
          tweet: pda,
          author: provider.wallet.publicKey
        }
      });
      const tweetAccounts1 = await program.account.tweet.all();
      console.log('tweet account: ', tweetAccounts1);
      getTweetsAndUsers();
    } catch (err) {
      console.log("Transaction error: ", err);
    }
  }

  async function deleteTweet() {
    const provider = await getProvider()
    console.log(programID.toBase58());
    const program = new Program(idl, programID, provider);
    try {
      const [userPda,userBump] = await PublicKey.findProgramAddress(
        [
          Buffer.from("twitter-user"),
          provider.wallet.publicKey.toBuffer()
        ],
        programID
      );
      const twitterUser = await program.account.twitterUser.fetch(userPda);
      console.log('tweet account: ', twitterUser);
      let tweets = await program.account.tweet.all();
      console.log('tweet account: ', tweets);
      // console.log(Uint8Array.from(parseInt(twittercount.toString())));
      const [pda,bump] = await PublicKey.findProgramAddress(
        [
          Buffer.from("tweet-account"),
          provider.wallet.publicKey.toBuffer(),
          tweets[0].account.address.toBuffer()
        ],
        programID
      );
      // const [pda,bump] = await PublicKey.findProgramAddress(
      //   [
      //     anchor.utils.bytes.utf8.encode("tweet-account"),
      //     provider.wallet.publicKey.toBuffer(),
      //     tweetAccounts2[0].publicKey.toBuffer()
      //   ],
      //   programID
      // );
      const updateAddress = await program.rpc.updateNextAddress(tweets[0].account.address, {
        accounts: {
          author: provider.wallet.publicKey,
          twitterUser: userPda,
        }
      });
      // const tweets = await program.account.tweet.all();
      // const tweetAccounts = await program.account.tweet.fetch(pda);
      // console.log('tweet account: ', tweets);
      const account = await program.rpc.deleteTweet({
        accounts: {
          twitterUser: userPda,
          tweet: pda,
          author: provider.wallet.publicKey
        }
      });
      console.log("signature",account)
      const tweetAccounts1 = await program.account.tweet.all();
      console.log('tweet account: ', tweetAccounts1);
      getTweetsAndUsers();
    } catch (err) {
      console.log("Transaction error: ", err);
    }
  }

  async function createAccount() {
    const provider = await getProvider()
    console.log(programID.toBase58());
    const program = new Program(idl, programID, provider);
    try {
      const [pda,bump] = await PublicKey.findProgramAddress(
        [
          anchor.utils.bytes.utf8.encode("twitter-user"),
          provider.wallet.publicKey.toBuffer()
        ],
        programID
      );
      const account = await program.rpc.createTwitterAccount("vamsi",{
        accounts: {
          author: provider.wallet.publicKey,
          twitterUser: pda,
          systemProgram: web3.SystemProgram.programId,
        }
      });
      getTweetsAndUsers();
    } catch (err) {
      console.log("Transaction error: ", err);
    }
  }

  async function updateAccount(item) {
    const provider = await getProvider();
    console.log(item);
    console.log(provider.wallet.publicKey.toBase58());
    const program = new Program(idl, programID, provider);
    try {
      const opts = {
        preflightCommitment: "processed"
      }
      const network = "http://127.0.0.1:8899";
      const connection = new Connection(network, opts.preflightCommitment);
      const [pda,bump] = await PublicKey.findProgramAddress(
        [
          Buffer.from("twitter-user"),
          provider.wallet.publicKey.toBuffer()
        ],
        programID
      );
      const account = await program.rpc.changeUserName("mcnole",{
        accounts: {
          author: provider.wallet.publicKey,
          twitterUser: pda
        }
      });
      getTweetsAndUsers();
    } catch (err) {
      console.log("Transaction error: ", err);
    }
  }

  async function deleteAccount() {
    const provider = await getProvider()
    console.log(programID.toBase58());
    const program = new Program(idl, programID, provider);
    try {
      const [pda,bump] = await PublicKey.findProgramAddress(
        [
          anchor.utils.bytes.utf8.encode("twitter-user"),
          provider.wallet.publicKey.toBuffer()
        ],
        programID
      );
      const account = await program.rpc.deleteTwitterAccount({
        accounts: {
          twitterUser: pda,
          author: provider.wallet.publicKey
        }
      });
      getTweetsAndUsers();
    } catch (err) {
      console.log("Transaction error: ", err);
    }
  }

  if (!wallet.connected) {
    /* If the user's wallet is not connected, display connect wallet button. */
    return ( 
      <div style = {
        {
          display: 'flex',
          justifyContent: 'center',
          marginTop: '100px'
        }
      } >
      <WalletMultiButton />
      </div>
    )
  } else {
    return ( 

      <div className = "App" >
        <div className='Main-header'> 
          {value && !value.gotTweetsUser && !value.gotTweets && ( <Button onClick={getTweetsAndUsers}>Get Tweets and Users</Button>)}
        </div> 
        {
          value && (
            <div className='Main-body'>
              <Row>
                <Col xs={12} md={4} sm={4}>
                  <div className='Twitter-Users-box'>
                    <h3 className='pull-left full-width text-center'>Twitter Users</h3>
                    <ul>
                      {(value.twitterUsers && value.twitterUsers.length > 0) && (
                        value.twitterUsers.map(function(user) {
                          return (
                            <li>
                              <label>
                                <span className='username'>{user.account.username}</span>
                                <span className='user-actions'><FontAwesomeIcon className='pull-right fs-12 m-l-10 m-t-4' onClick={deleteAccount} icon={solid('trash')} /><FontAwesomeIcon className='pull-right fs-12 m-t-4' onClick={updateAccount} icon={solid('pencil')} /></span>
                              </label>
                              <p>{user.publicKey.toBase58()}</p>
                            </li>
                          );
                        })
                      )}
                    </ul>
                    {(!value.twitterUsers || value.twitterUsers.length == 0) && (
                      <div class="pull-left full-width text-center">
                        <Button onClick={createAccount} variant="info" className='m-t-10 m-b-10'>Create New User Account</Button>
                      </div>
                    )}
                  </div>
                </Col>
                <Col xs={12} md={8} sm={8}>
                  <div className='Twitter-Tweets-box'>
                  <h3 className='pull-left full-width text-center'>Tweets</h3>
                  <ul>
                      {(value.tweets && value.tweets.length > 0) && (
                        value.tweets.map(function(tweet) {
                          return (
                            <li className={tweet.isEditing ? 'editign-now': ''}>
                              <label>
                                <span className='username'>{tweet.account.topic}</span>
                                <span className='user-actions'><FontAwesomeIcon className='pull-right fs-12 m-l-10 m-t-4' onClick={deleteTweet} icon={solid('trash')} /><FontAwesomeIcon className='pull-right fs-12 m-t-4' onClick={() => justUpdateKey(tweet)} icon={solid('pencil')} /></span>
                                <span className='pull-left full-width'>{tweet.account.content}</span>
                              </label>
                              <p>{tweet.publicKey.toBase58()}</p>
                            </li>
                          );
                        })
                      )}
                    </ul>
                    {(value.twitterUsers && value.twitterUsers.length > 0) && (
                      <div class="pull-left full-width text-center">
                        <Form onSubmit={handleSubmit} validated={value.validated}>
                          <Form.Group as={Col} md="12" controlId="new_topic">
                            <Form.Label>Topic</Form.Label>
                            <Form.Control
                              required
                              type="text"
                              placeholder="Topic"
                              value={value.new_topic}
                              onChange={() => changingInputs(value.new_content,2)}
                            />
                            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                          </Form.Group>
                          <Form.Group as={Col} md="12" controlId="new_content">
                            <Form.Label>Content</Form.Label>
                            <Form.Control
                              required
                              type="text"
                              placeholder="Content"
                              value={value.new_content}
                              onChange={() => changingInputs(value.new_content,2)}
                            />
                            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                          </Form.Group>
                        </Form>
                        <Button onClick={sendTweet} disabled={value.isLoading} variant="info" className='m-t-10 m-b-10'>{value.isLoading ? 'Sending…' : value.isEditing ? 'Update Tweet' : 'Send Tweet'}</Button>
                      </div>
                    )}
                  </div>
                </Col>
              </Row>
            </div>
          )
        }
      </div>
      );
    }
  }

  /* wallet configuration as specified here: https://github.com/solana-labs/wallet-adapter#setup */
  const AppWithProvider = () => ( 
    <ConnectionProvider endpoint = "http://127.0.0.1:8899" >
    <WalletProvider wallets = {
      wallets
    }
    autoConnect >
    <WalletModalProvider >
    <App />
    </WalletModalProvider> </WalletProvider> </ConnectionProvider>
  )

  export default AppWithProvider;
