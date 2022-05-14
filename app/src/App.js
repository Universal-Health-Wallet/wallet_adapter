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
    new_content: '',
    user_name_editing: false,
    new_username: ''
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
        editigTweetAddress: null,
        user_name_editing: false,
        new_username: value.new_username
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
        user_name_editing: false,
        editigTweetAddress: null,
        new_topic: '',
        new_content: '',
        new_username: value.new_username
      });
    }
  }

  async function getTweetsAndUsers() {
    getTwitterUsers();
    getTweets();
  }

  async function testingFn() {
    if(!value.functionCalled) {
      console.log('test');
      getTweetsAndUsers();
      setValue({
        functionCalled: true,
        isTweetEditing: false,
        editigTweetAddress: null,
        user_name_editing: false,
        twitterUsers: value.twitterUsers,
        tweets: value.tweets,
        new_username: value.new_username
      });
    }
  };

  testingFn();

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
      user_name_editing: false,
      new_topic: '',
      new_content: '',
      twitterUsers: value.twitterUsers,
      tweets: value.tweets,
      new_username: value.new_username
    })
  }

  async function sendTweet() {
    if (value.editigTweetAddress && value.editigTweetAddress.length > 0 && value.isTweetEditing) {
      for (let i = 0; i < value.tweets.length; i++) {
        if (value.tweets[i].account.address.toBase58() == value.editigTweetAddress) {
          updateTweet(value.tweets[i].account.address);
        }
      }
    }
    else {
      const provider = await getProvider()
    /* create the program interface combining the idl, program ID, and provider */
    console.log(programID.toBase58());
    const program = new Program(idl, programID, provider);
    // console.log(value.new_content);
    // console.log(value.new_topic);
    let topic = value.new_content;
    let content = value.new_topic;
    if (topic && topic.length > 0) {
      if (content && content.length > 0) {
        try {
          setValue({
            isLoading: true,
            user_name_editing: false,
            functionCalled: true,
            isTweetEditing: false,
            editigTweetAddress: null,
            twitterUsers: value.twitterUsers,
            tweets: value.tweets,
            new_username: value.new_username
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
            functionCalled: true,
            twitterUsers: value.twitterUsers,
            user_name_editing: false,
            tweets: value.tweets,
            new_topic: '',
            new_content: '',
            isTweetEditing: value.isTweetEditing,
            editigTweetAddress: value.editigTweetAddress,
            new_username: value.new_username
          });
        } catch (err) {
          setValue({
            isLoading: false,
            functionCalled: true,
            isTweetEditing: false,
            editigTweetAddress: null,
            twitterUsers: value.twitterUsers,
            tweets: value.tweets,
            new_topic: '',
            new_content: '',
            user_name_editing: false,
            new_username: value.new_username
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
  }

  async function updateAccountKey(user) {
    setValue({
      isTweetEditing: true,
      functionCalled: true,
      editigTweetAddress: null,
      new_content: value.new_content,
      new_topic: value.new_topic,
      twitterUsers: value.twitterUsers,
      tweets: value.tweets,
      user_name_editing: true,
      new_username: user.account.username
    });
  }

  async function justUpdateKey(tweet) {
    // console.log(tweet);
    setValue({
      isTweetEditing: true,
      functionCalled: true,
      editigTweetAddress: tweet.account.address.toBase58(),
      new_content: tweet.account.content,
      new_topic: tweet.account.topic,
      twitterUsers: value.twitterUsers,
      tweets: value.tweets,
      user_name_editing: false,
      new_username: value.new_username
    });
  }

  async function updateTweet(tweet_public_key) {
    const provider = await getProvider()
    /* create the program interface combining the idl, program ID, and provider */
    console.log(programID.toBase58());
    const program = new Program(idl, programID, provider);
    let topic = value.new_content;
    let content = value.new_topic;
    if (topic && topic.length > 0) {
      if (content && content.length > 0) {
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
          const [pda,bump] = await PublicKey.findProgramAddress(
            [
              anchor.utils.bytes.utf8.encode("tweet-account"),
              provider.wallet.publicKey.toBuffer(),
              tweet_public_key.toBuffer()
            ],
            programID
          );
          const updateAddress = await program.rpc.updateNextAddress(tweet_public_key, {
            accounts: {
              author: provider.wallet.publicKey,
              twitterUser: userPda,
            }
          });
          const account = await program.rpc.updateTweet(topic, content, {
            accounts: {
              twitterUser: userPda,
              tweet: pda,
              author: provider.wallet.publicKey
            }
          });
          setValue({
            isLoading: false,
            functionCalled: true,
            isTweetEditing: false,
            editigTweetAddress: null,
            twitterUsers: value.twitterUsers,
            tweets: value.tweets,
            new_topic: '',
            new_content: '',
            user_name_editing: false,
            new_username: value.new_username
          })
          getTweetsAndUsers();
        } catch (err) {
          console.log("Transaction error: ", err);
        }
      }
      else {
        toast.error("Content cannot be empty", { position: toast.POSITION.TOP_RIGHT })
      }
    }
    else {
      toast.error("Topic cannot be empty", { position: toast.POSITION.TOP_RIGHT })
    }
    
  }

  async function deleteTweet(event) {
    var address = event.target.parentElement.id;
    for (let i = 0; i < value.tweets.length; i++) {
      if (value.tweets[i].publicKey.toBase58() == address) {
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
          const [pda,bump] = await PublicKey.findProgramAddress(
            [
              Buffer.from("tweet-account"),
              provider.wallet.publicKey.toBuffer(),
              value.tweets[i].publicKey.toBuffer()
            ],
            programID
          );
          const updateAddress = await program.rpc.updateNextAddress(value.tweets[i].publicKey, {
            accounts: {
              author: provider.wallet.publicKey,
              twitterUser: userPda,
            }
          });
          const account = await program.rpc.deleteTweet({
            accounts: {
              twitterUser: userPda,
              tweet: pda,
              author: provider.wallet.publicKey
            }
          });
          getTweetsAndUsers();
        } catch (err) {
          console.log("Transaction error: ", err);
        }
        break;
      }
    }
  }

  async function createAccount() {
    if (value.user_name_editing) {
      updateAccount()
    }
    else {
      const provider = await getProvider()
      console.log(programID.toBase58());
      const program = new Program(idl, programID, provider);
      let username = value.new_username;
      if (username && username.length > 0) {
        try {
          const [pda,bump] = await PublicKey.findProgramAddress(
            [
              anchor.utils.bytes.utf8.encode("twitter-user"),
              provider.wallet.publicKey.toBuffer()
            ],
            programID
          );
          const account = await program.rpc.createTwitterAccount(username,{
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
      else {
        toast.error("Topic cannot be empty", { position: toast.POSITION.TOP_RIGHT })
      }
    }
  }

  async function changeUsername(event) {
    setValue({
      new_topic: event.target.value,
      functionCalled: true,
      new_content: value.new_content,
      twitterUsers: value.twitterUsers,
      tweets: value.tweets,
      isTweetEditing: value.isTweetEditing,
      editigTweetAddress: value.editigTweetAddress,
      user_name_editing: value.user_name_editing,
      new_username: event.target.value
    })
  }

  async function changeTopic(event) {
    // console.log(event.target.value);
    setValue({
      new_topic: event.target.value,
      functionCalled: true,
      new_content: value.new_content,
      twitterUsers: value.twitterUsers,
      tweets: value.tweets,
      isTweetEditing: value.isTweetEditing,
      editigTweetAddress: value.editigTweetAddress,
      user_name_editing: false,
      new_username: value.new_username
    })
  }

  async function changeContent(event) {
    // console.log(event.target.value);
    setValue({
      new_content: event.target.value,
      functionCalled: true,
      new_topic: value.new_topic,
      twitterUsers: value.twitterUsers,
      tweets: value.tweets,
      isTweetEditing: value.isTweetEditing,
      user_name_editing: false,
      editigTweetAddress: value.editigTweetAddress,
    })
  }

  async function updateAccount(item) {
    const provider = await getProvider();
    console.log(item);
    console.log(provider.wallet.publicKey.toBase58());
    const program = new Program(idl, programID, provider);
    let username = value.new_username;
    if (username && username.length > 0) {
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
        const account = await program.rpc.changeUserName(username,{
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
    else {
      toast.error("Topic cannot be empty", { position: toast.POSITION.TOP_RIGHT })
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
          <h2 className='pull-left full-width text-center'>Twitter on Solana</h2>
        </div> 
        {
          value && (
            <div className='Main-body'>
              <Row>
                <Col xs={12} md={4} sm={4}>
                  <div className='Twitter-Users-box'>
                    {/* <h3 className='pull-left full-width text-center'>Twitter Users</h3> */}
                    <ul>
                      {(value.twitterUsers && value.twitterUsers.length > 0) && (
                        value.twitterUsers.map(function(user) {
                          return (
                            <li>
                              <label>
                                <span className='username'>{user.account.username}</span>
                                <span className='user-actions'><FontAwesomeIcon title='Delete User Account' className='pull-right fs-12 m-l-10 m-t-4 pointer' onClick={deleteAccount} icon={solid('trash')} /><FontAwesomeIcon title='Update User Account' className='pull-right fs-12 m-t-4 pointer' onClick={() => updateAccountKey(user)} icon={solid('pencil')} /></span>
                              </label>
                              <p><FontAwesomeIcon title='Wallet Address' className='m-r-5 fs-12 pull-left m-t-2' icon={solid('wallet')}></FontAwesomeIcon><span className='pull-left wallet-address-part'>{user.publicKey.toBase58()}</span></p>
                            </li>
                          );
                        })
                      )}
                    </ul>
                    {((!value.twitterUsers || value.twitterUsers.length == 0) || value.user_name_editing) && (
                      <div class="pull-left full-width text-center">
                        <Form onSubmit={handleSubmit} validated={value.validated}>
                          <Form.Group as={Col} md="12" sm="12" xs="12" className='pull-left padding-6' controlId="username">
                            {/* <Form.Label>Topic</Form.Label> */}
                            <Form.Control
                              required
                              type="text"
                              placeholder="Username"
                              defaultValue={value.new_username}
                              onChange={changeUsername}
                            />
                            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                          </Form.Group>
                        </Form>
                        <Button onClick={createAccount} variant="info" className='m-t-10 m-b-10'>{value.user_name_editing ? 'Update User Account' : 'Create New User Account'}</Button>
                      </div>
                    )}
                  </div>
                </Col>
                <Col xs={12} md={8} sm={8}>
                  <div className='Twitter-Tweets-box'>
                  {/* <h3 className='pull-left full-width text-center'>Tweets</h3> */}
                  <ul>
                      {(value.tweets && value.tweets.length > 0) && (
                        value.tweets.map(function(tweet) {
                          return (
                            <li className={tweet.account.address.toBase58() == value.editigTweetAddress ? 'editing-now': ''}>
                              <label>
                                <span className='username'>{tweet.account.topic}</span>
                                <span className='user-actions'><FontAwesomeIcon title='Delete Tweet' className='pull-right fs-12 m-l-10 m-t-4 pointer' id={tweet.publicKey.toBase58()} onClick={deleteTweet} icon={solid('trash')} /><FontAwesomeIcon title='Update Tweet' className='pull-right fs-12 m-t-4 pointer' onClick={() => justUpdateKey(tweet)} icon={solid('pencil')} /></span>
                                <span className='pull-left full-width'>{tweet.account.content}</span>
                              </label>
                              <p><FontAwesomeIcon title='Wallet Address' className='m-r-5 fs-12 pull-left m-t-2' icon={solid('wallet')}></FontAwesomeIcon><span className='pull-left wallet-address-part'>{tweet.publicKey.toBase58()}</span></p>
                            </li>
                          );
                        })
                      )}
                    </ul>
                    {(value.twitterUsers && value.twitterUsers.length > 0) && (
                      <div class="pull-left full-width text-center border b-b-0">
                        <Form onSubmit={handleSubmit} validated={value.validated}>
                          <Form.Group as={Col} md="6" sm="6" xs="12" className='pull-left padding-6' controlId="new_topic">
                            {/* <Form.Label>Topic</Form.Label> */}
                            <Form.Control
                              required
                              type="text"
                              placeholder="Topic"
                              as="textarea" 
                              rows={2}
                              defaultValue={value.new_topic}
                              onChange={changeTopic}
                            />
                            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                          </Form.Group>
                          <Form.Group as={Col} md="6" sm="6" xs="12" className='pull-left padding-6' controlId="new_content">
                            {/* <Form.Label>Content</Form.Label> */}
                            <Form.Control
                              required
                              type="text"
                              placeholder="Content"
                              as="textarea" 
                              rows={2}
                              defaultValue={value.new_content}
                              onChange={changeContent}
                            />
                            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                          </Form.Group>
                        </Form>
                        <Button onClick={sendTweet} disabled={value.isLoading} variant="info" className='m-t-10 m-b-10'>{value.isLoading ? 'Sending…' : value.isTweetEditing ? 'Update Tweet' : 'Send Tweet'}</Button>
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
