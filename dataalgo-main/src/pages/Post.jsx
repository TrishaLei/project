import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate} from 'react-router-dom';
import { format, formatDistanceToNow, differenceInYears } from 'date-fns';

// Custom Components
import { GetCookie } from '../components/auth/cookies.jsx';

//Ant Design Components && Icons
import { Button, Modal } from 'antd';
import UpArrow from "../assets/images/arrow-big-up.svg";
import DownArrow from "../assets/images/arrow-big-down.svg";

//CSS Components for styling
import PostStyle from '../assets/styles/post.module.css'; // Post.jsx Main CSS
import PostModel from "../assets/styles/PostModel.module.css";
import ModalStyle from "../assets/styles/modal.module.css";

//Custom alert Components
import AlertComponent from '../components/Alert/AlertComponent.jsx';
import { showAlert } from '../components/Alert/ShowAlert.js';
const API_BASE_URL = import.meta.env.VITE_DOMAIN_API;

const Post = () => {
  //System Variables && Parameters from URL
  const { postid } = useParams();
  const navigate = useNavigate();

  // User Variables
  const userData = GetCookie('data');
  const userid = userData ? userData.id : null;

  // Posts Variables
  const [post, setPost] = useState([]);
  const [showAttachments, setShowAttachments] = useState({});
  const [SubscribeModal, setSubscribeModal] = useState(false);
  const [SubscribeModalContent, setSubscribeModalContent] = useState(null);
  const [PremiumModal, setPremiumModal] = useState(false);
  const [PremiumModalContent, setPremiumModalContent] = useState(null);

  // Custom alert variables
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [alertVisible, setAlertVisible] = useState(false);

  // Fetch Post Data
  useEffect(() => {
    try {
      fetch(`${API_BASE_URL}/post/${postid}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(response => response.json())
      .then(data => {
        if (!data || data.length === 0) {
          setPost(null);
        } else {
          console.log(data);
          setPost(data);
        }
      })
      .catch(error => {
        setPost(null);
        console.error('Error fetching post data:', error);
      });
    } catch (error) {
      setPost(null);
      console.error('Error fetching post data:', error);
    }
  }, [postid]);

  //Posts Interactions
  const handleUpvote = async (postId) => {
    try {
      const userData = GetCookie('data');
      if (!userData) {
        showAlert(setAlert, setAlertVisible, 'error', 'Please login first!');
        return;
      }
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/upvote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${userData.token}`
        },
        body: JSON.stringify({ userId:userData.id }),
      });
      if (response.ok) {
        const updatedPost = await response.json();
        setPost(updatedPost);
      }
    } catch (error) {
      console.error('Error upvoting post:', error);
    }
  };

  const handleDownvote = async (postId) => {
    try {
      const userData = GetCookie('data');
      if (!userData) {
        showAlert(setAlert, setAlertVisible, 'error', 'Please login first!');
        return;
      }
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/downvote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${userData.token}`
        },
        body: JSON.stringify({ userId:userData.id }),
      });
      if (response.ok) {
        const updatedPost = await response.json();
        setPost(updatedPost);
      }
    } catch (error) {
      console.error('Error downvoting post:', error);
    }
  };

  const handleSubscribe = async (AuthorName) => {
    try {
      navigate('/eduhub/profile/' + AuthorName);
    } catch (error) {
      console.error('Error downvoting post:', error);
    }
  };

  const handlePurchase = async (PostID, PostPrice) => {
    try {
      const userData = GetCookie('data');
      if (!userData) {
        showAlert(setAlert, setAlertVisible, 'error', 'Please login first!');
        return;
      }
      const UserDataResponse = await fetch(`${API_BASE_URL}/user/${userData.username}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (UserDataResponse.ok) {
        const userDataServer = await UserDataResponse.json();
        if(PostPrice > userDataServer.balance){
          showAlert(setAlert, setAlertVisible, 'error', 'Insufficient balance!');
          return;
        }
        const PurchaseResponse = await fetch(`${API_BASE_URL}/purchase/${PostID}/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `${userData.token}`
          },
          body: JSON.stringify({ username:userData.username }),
        });
        if (PurchaseResponse.ok) {
          const updatedPost = await PurchaseResponse.json();
          setPost(updatedPost);
          window.dispatchEvent(new Event('userDataUpdate'));
          showAlert(setAlert, setAlertVisible, 'success', 'Purchase successful!');
          setPremiumModal(false);
        }
      }
    } catch (error) {
      console.error('Error downvoting post:', error);
    }
  };

  const DownloadContent = async (PostId, Filename) => {
    try {
      const userData = GetCookie('data');
      if (!userData) {
        showAlert(setAlert, setAlertVisible, 'error', 'Please login first!');
        return;
      }
      const response = await fetch(`${API_BASE_URL}/posts/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${userData.token}`
        },
        body: JSON.stringify({ PostId:PostId, userId:userData.id, Filename }),
      });
      if (response.ok) {
        const data = await response.blob();
        const url = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', Filename);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      } else if(response.status === 401) {
        showAlert(setAlert, setAlertVisible, 'error', 'You do not have access to this content.');
      } else if(response.status === 404) {
        showAlert(setAlert, setAlertVisible, 'error', 'File not found.');
      }
    } catch (error) {
      console.error('Error downloading content:', error);
    }
  };

  const toggleAttachments = (postId) => {
    setShowAttachments(prevState => ({
      ...prevState,
      [postId]: !prevState[postId]
    }));
  };

  // Post Content Type (Subscription, Premium, Free)
  const getClassName = (contentType) => {
    switch (contentType) {
      case 1:
        return PostModel.PostSubscription;
      case 2:
        return PostModel.PostPremium;
      default:
        return '';
    }
  };

  // Modal data handlers
  const SubscribeContent = (AuthorId, AuthorName, PostId, PostTitle, PostTags) => {
    const userData = GetCookie('data');
    if (!userData) {
      showAlert(setAlert, setAlertVisible, 'error', 'Please login first!');
      return;
    }
    setSubscribeModal(true);
    setSubscribeModalContent({AuthorId, AuthorName, PostId, PostTitle, PostTags});
  };
  
  const PremiumContent = (PostPrice, AuthorId, AuthorName, PostId, PostTitle, PostTags) => {
    const userData = GetCookie('data');
    if (!userData) {
      showAlert(setAlert, setAlertVisible, 'error', 'Please login first!');
      return;
    }
    setPremiumModal(true);
    setPremiumModalContent({PostPrice, AuthorId, AuthorName, PostId, PostTitle, PostTags});
  };

  //Data Checkers (If present or not)
  if (!postid) {
    return <p>Loading...</p>;
  }

  if (!post || post.length === 0 || post === null) {
    return <p>Post not available</p>;
  }

  return (
    <>
      <AlertComponent alert={alert} setAlert={setAlert} alertVisible={alertVisible} />

      <div className={PostStyle.Wrapper}>
        <div id={post.id} key={post.id} className={`${PostModel.Post} ${getClassName(post.contentType)}`}>
          <div className={PostModel.PostHeader}>
            <h2 className={PostModel.PostTitle}>{post.title}</h2>
            <span className={PostModel.PostTimestamp}>
            {post.PostDate && !isNaN(Date.parse(post.PostDate)) ? (
              differenceInYears(new Date(), new Date(Date.parse(post.PostDate))) >= 1
                ? format(new Date(Date.parse(post.PostDate)), 'MMMM d, yyyy')
                : formatDistanceToNow(new Date(Date.parse(post.PostDate)), { addSuffix: true })
            ) : (
              'Invalid date'
            )}
            </span>
          </div>
          <p className={PostModel.PostTags}>Tags: {post.tags}</p>
          <p className={PostModel.PostAuthor}>
            Posted by
            <img src={ `${API_BASE_URL}/avatar/${post.userId}`}  className={PostModel.PostAuthorIcon}alt="User" />
            <Link to={`/eduhub/profile/${post.username}`} className={PostModel.PostAuthorName}>
              <span>{post.username}</span>
            </Link>
          </p>
          {(() => {
            switch (post.contentType) {
              case 1:
                return (
                  <>
                    {post.subscribers.includes(userid) || (post.userId == userid) ? (
                        <>
                          <div className={PostModel.Post}>
                            <div className={PostModel.PostActions}>  
                              <p>{post.description}</p>
                            </div>
                          </div>
                          {post.AttachmentCount > 0 ? (
                            <div className={PostModel.ContentPost}>
                              <p className={PostModel.ContentTitle}>
                                Post Attachments
                              </p>
                              <div className={PostModel.PostActions}>
                                <button className={PostModel.ShowMoreButton} onClick={() => toggleAttachments(post.id)}>
                                  {showAttachments[post.id] ? 'Hide Attachments' : 'Show Attachments'}
                                </button>
                              </div>
                              {showAttachments[post.id] && JSON.parse(post.attachments).map((attachment, index) => (
                                <button key={index} className={PostModel.PostDownloadButton} onClick={() => DownloadContent(post.id, attachment)}>
                                  <i className="fas fa-paperclip"></i> {attachment}
                                </button>
                              ))}
                            </div>
                          ) : null}
                        </>
                    ) : (
                      <div className={PostModel.LockedContainer}>
                        <p>This content is locked. Please subscribe to access.</p>
                        <button className={PostModel.PostActionsButton} onClick={() => SubscribeContent(post.userId, post.username, post.id, post.title, post.tags)}>Subscribe</button>
                      </div>
                    )}
                    <div className={PostModel.PostActions}>
                    <button onClick={() => handleUpvote(post.id)} className={`${PostModel.PostActionsButton} ${PostModel.ButtonVote} ${post.upvotes.includes(userid) ? PostModel.ButtonVoted : ''}`}>
                      <img src={UpArrow} alt="Upvote" />
                    </button>
                    <p>{post.upvotes.length - post.downvotes.length}</p>
                    <button onClick={() => handleDownvote(post.id)} className={`${PostModel.PostActionsButton} ${PostModel.ButtonVote} ${post.downvotes.includes(userid) ? PostModel.ButtonVoted : ''}`}>
                      <img src={DownArrow} alt="Downvote" />
                    </button>
                  </div>
                  </>
                );
              case 2:
                return (
                  <>
                    {post.purchase.includes(userid) || (post.userId == userid) ? (
                      <>
                        <div className={PostModel.Post}>
                          <div className={PostModel.PostActions}>  
                            <p>{post.description}</p>
                          </div>
                        </div>
                        {post.AttachmentCount > 0 ? (
                          <div className={PostModel.ContentPost}>
                            <p className={PostModel.ContentTitle}>
                              Post Attachments
                            </p>
                            <div className={PostModel.PostActions}>
                              <button className={PostModel.ShowMoreButton} onClick={() => toggleAttachments(post.id)}>
                                {showAttachments[post.id] ? 'Hide Attachments' : 'Show Attachments'}
                              </button>
                            </div>
                            {showAttachments[post.id] && JSON.parse(post.attachments).map((attachment, index) => (
                              <button key={index} className={PostModel.PostDownloadButton} onClick={() => DownloadContent(post.id, attachment)}>
                                <i className="fas fa-paperclip"></i> {attachment}
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </>
                    ) : (
                      <div className={PostModel.LockedContainer}>
                        <p>This content is locked. Please purchase to access.</p>
                        <p className={PostModel.PostPrice}>${post.price.toFixed(2)}</p>
                        <button className={PostModel.PostActionsButton} onClick={() => PremiumContent(post.price.toFixed(2), post.userId, post.username, post.id, post.title, post.tags)}>Buy Now</button>
                      </div>
                    )}
                    <div className={PostModel.PostActions}>
                      <button onClick={() => handleUpvote(post.id)} className={`${PostModel.PostActionsButton} ${PostModel.ButtonVote} ${post.upvotes.includes(userid) ? PostModel.ButtonVoted : ''}`}>
                        <img src={UpArrow} alt="Upvote" />
                      </button>
                      <p>{post.upvotes.length - post.downvotes.length}</p>
                      <button onClick={() => handleDownvote(post.id)} className={`${PostModel.PostActionsButton} ${PostModel.ButtonVote} ${post.downvotes.includes(userid) ? PostModel.ButtonVoted : ''}`}>
                        <img src={DownArrow} alt="Downvote" />
                      </button>
                    </div>
                  </>
                );
              default:
                return (
                  <>
                  <div className={PostModel.Post}>
                    <div className={PostModel.PostActions}>  
                      <p>{post.description}</p>
                    </div>
                  </div>
                  {post.AttachmentCount > 0 ? (
                    <div className={PostModel.ContentPost}>
                      <p className={PostModel.ContentTitle}>
                        Post Attachments
                      </p>
                      <div className={PostModel.PostActions}>
                        <button className={PostModel.ShowMoreButton} onClick={() => toggleAttachments(post.id)}>
                          {showAttachments[post.id] ? 'Hide Attachments' : 'Show Attachments'}
                        </button>
                      </div>
                      {showAttachments[post.id] && JSON.parse(post.attachments).map((attachment, index) => (
                        <button key={index} className={PostModel.PostDownloadButton} onClick={() => DownloadContent(post.id, attachment)}>
                          <i className="fas fa-paperclip"></i> {attachment}
                        </button>
                      ))}
                    </div>
                  ) : null}
                  <div className={PostModel.PostActions}>
                    <button onClick={() => handleUpvote(post.id)} className={`${PostModel.PostActionsButton} ${PostModel.ButtonVote} ${post.upvotes && post.upvotes.includes(userid) ? PostModel.ButtonVoted : ''}`}>
                      <img src={UpArrow} alt="Upvote" />
                    </button>
                    <p>{post.upvotes && post.upvotes.length - post.downvotes.length}</p>
                    <button onClick={() => handleDownvote(post.id)} className={`${PostModel.PostActionsButton} ${PostModel.ButtonVote} ${post.downvotes && post.downvotes.includes(userid) ? PostModel.ButtonVoted : ''}`}>
                      <img src={DownArrow} alt="Downvote" />
                    </button>
                  </div>
                  </>
                );
            }
          })()}
        </div>
      </div>
      <Modal
        title="Purchase Content"
        open={PremiumModal}
        onCancel={() => setPremiumModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setPremiumModal(false)}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={() => handlePurchase(PremiumModalContent?.PostId, PremiumModalContent?.PostPrice)}>
            Confirm
          </Button>,
        ]}
      >
        <div>
          <div className={ModalStyle.Post}>
            <p className={ModalStyle.ModalTitle}>{PremiumModalContent?.PostTitle}</p>
            <div className={ModalStyle.ModalTitle}>
              Posted by: 
              <img src={ `${API_BASE_URL}/avatar/${PremiumModalContent?.AuthorId}`}  style={{margin: '0 0.25rem', width: '15px', height: '15px', borderRadius: '50%', overflow: 'hidden', display: 'inline-flex', justifyContent: 'center', alignItems: 'center'}} alt="User" />
              <div className={ModalStyle.Bold}>{PremiumModalContent?.AuthorName}</div>
            </div>
          </div>
        </div>
        <div>Price: <strong>${PremiumModalContent?.PostPrice}</strong></div>
        <p>Do you want to purchase this content from {PremiumModalContent?.AuthorName}?</p>
      </Modal>
      <Modal
        title="Subscription"
        open={SubscribeModal}
        onCancel={() => setSubscribeModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setSubscribeModal(false)}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={() => handleSubscribe(SubscribeModalContent?.AuthorName)}>
            Confirm
          </Button>,
        ]}
      >
        <div>
            <div className={ModalStyle.Post}>
              <p className={ModalStyle.ModalTitle}>{SubscribeModalContent?.PostTitle}</p>
              <div className={ModalStyle.ModalAuthor}>
                <div className={ModalStyle.ModalTitle}>
                  Posted by: 
                  <img src={ `${API_BASE_URL}/avatar/${SubscribeModalContent?.AuthorId}`}  style={{margin: '0 0.25rem', width: '15px', height: '15px', borderRadius: '50%', overflow: 'hidden', display: 'inline-flex', justifyContent: 'center', alignItems: 'center'}} alt="User" />
                  <div className={ModalStyle.Bold}>{SubscribeModalContent?.AuthorName}</div>
                </div>
              </div>
            </div>
          </div>
        <p>Do you want to subscribe to {SubscribeModalContent?.AuthorName}?</p>
      </Modal>
    </>
  );
};

export default Post;