import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate} from 'react-router-dom';
import { format, formatDistanceToNow, differenceInYears } from 'date-fns';
import UpArrow from "../assets/images/arrow-big-up.svg";
import DownArrow from "../assets/images/arrow-big-down.svg";
import PostStyle from '../assets/styles/post.module.css';
import PostModel from "../assets/styles/PostModel.module.css";
import { GetCookie } from '../components/auth/cookies.jsx';
import AlertComponent from '../components/Alert/AlertComponent.jsx';
import { showAlert } from '../components/Alert/ShowAlert.js';

import Modal from '../components/Modal/Modal.jsx';
import ModalStyle from "../assets/styles/modal.module.css";

const Post = () => {
  const { postid } = useParams();
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [alertVisible, setAlertVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [showAttachments, setShowAttachments] = useState({});
  const [post, setPost] = useState([]);

  const navigate = useNavigate();

  const userData = GetCookie('data');
  const username = userData ? userData.username : null;
  const userid = userData ? userData.id : null;
  const usertoken = userData ? userData.token : null;

  const handleUpvote = async (postId) => {
    try {
      const userData = GetCookie('data');
      if (!userData) {
        showAlert(setAlert, setAlertVisible, 'error', 'Please login first!');
        return;
      }
      const response = await fetch(`http://localhost:5000/posts/${postId}/upvote`, {
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
      const response = await fetch(`http://localhost:5000/posts/${postId}/downvote`, {
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


  useEffect(() => {
      fetch(`http://localhost:5000/post/${postid}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data.length === 0) {
          navigate('/');
        } else {
          console.log(data);
          setPost(data);
        }
      })
      .catch(error => console.error('Error fetching user data:', error));
  }, [postid]);

  const handlePurchase = async (PostID, PostPrice) => {
    try {
      const userData = GetCookie('data');
      if (!userData) {
        showAlert(setAlert, setAlertVisible, 'error', 'Please login first!');
        return;
      }
      const UserDataResponse = await fetch(`http://localhost:5000/user/${userData.username}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log(UserDataResponse);
      if (UserDataResponse.ok) {
        const userDataServer = await UserDataResponse.json();
        if(PostPrice > userDataServer.balance){
          showAlert(setAlert, setAlertVisible, 'error', 'Insufficient balance!');
          return;
        }
        const PurchaseResponse = await fetch(`http://localhost:5000/purchase/${PostID}/`, {
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
          closeModal();
        }
      }
    } catch (error) {
      console.error('Error downvoting post:', error);
    }
  };

  const handleSubscribe = async (AuthorName) => {
    try {
      navigate('/profile/' + AuthorName);
    } catch (error) {
      console.error('Error downvoting post:', error);
    }
  };

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

  const openModal = (PostPrice, ContentType, AuthorId, AuthorName, PostId, PostTitle, PostTags, ModalTitle, ModalContent) => {
    const userData = GetCookie('data');
    if (!userData) {
      showAlert(setAlert, setAlertVisible, 'error', 'Please login first!');
      return;
    }
    setModalContent({PostPrice, ContentType, AuthorId, AuthorName, PostId, PostTitle, PostTags, ModalTitle, ModalContent});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent(null);
  };


  const PremiumContent = (PostPrice, ContentType, AuthorId, AuthorName, PostId, PostTitle, PostTags) => {
    openModal(PostPrice, ContentType, AuthorId, AuthorName, PostId, PostTitle, PostTags, 'Purchase', `Are you sure you want to purchase this content for $${PostPrice}?`);
  };

  const SubscribeContent = (ContentType, AuthorId, AuthorName, PostId, PostTitle, PostTags) => {
    openModal(0, ContentType, AuthorId, AuthorName, PostId, PostTitle, PostTags, 'Subscription', `Are you sure you want to subscribe to ${AuthorName}?`);
  };

  const toggleAttachments = (postId) => {
    setShowAttachments(prevState => ({
      ...prevState,
      [postId]: !prevState[postId]
    }));
  };

  const DownloadContent = async (PostId, Filename) => {
    try {
      const userData = GetCookie('data');
      if (!userData) {
        showAlert(setAlert, setAlertVisible, 'error', 'Please login first!');
        return;
      }
      const response = await fetch(`http://localhost:5000/posts/download`, {
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

  if (!postid) {
    return <p>Loading...</p>;
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
          <img src={ `http://localhost:5000/avatar/${post.userId}`}  className={PostModel.PostAuthorIcon}alt="User" />
          <Link to={`/profile/${post.username}`} className={PostModel.PostAuthorName}>
            <span>{post.username}</span>
          </Link>
        </p>
        {(() => {
          switch (post.contentType) {
            case 1:
              return (
                <>
                  {post.isSubscribed || (post.userId == userid) ? (
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
                      <button className={PostModel.PostActionsButton} onClick={() => SubscribeContent(post.contentType, post.userId, post.username, post.id, post.title, post.tags)}>Subscribe</button>
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
                      <button className={PostModel.PostActionsButton} onClick={() => PremiumContent(post.price.toFixed(2), post.contentType, post.userId, post.username, post.id, post.title, post.tags)}>Buy Now</button>
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
    <Modal show={isModalOpen} onClose={closeModal}>
          <h2>{modalContent?.ModalTitle}</h2>
          <div>
            <p>{modalContent?.ModalContent}</p>
            <div className={ModalStyle.Post}>
              <p className={ModalStyle.ModalTitle}>{modalContent?.PostTitle}</p>
              <div className={ModalStyle.ModalAuthor}>
                <p className={ModalStyle.ModalTitle}>
                  Posted by: 
                  <img src={ `http://localhost:5000/avatar/${modalContent?.AuthorId}`}  style={{margin: '0 0.25rem', width: '15px', height: '15px', borderRadius: '50%', overflow: 'hidden', display: 'inline-flex', justifyContent: 'center', alignItems: 'center'}} alt="User" />
                  <span className={ModalStyle.Bold}>{modalContent?.AuthorName}</span>
                </p>
              </div>
            </div>
          </div>
          {(() => {
            switch (modalContent?.ContentType) {
              case 1:
                return (
                  <div className={ModalStyle.PostActions}>
                    <button className={ModalStyle.ModalButton} onClick={() => handleSubscribe(modalContent?.AuthorName)}>Yes</button><button className={ModalStyle.ModalButton} onClick={closeModal}>No</button>
                  </div>
                );
              case 2:
                return(
                  <div className={ModalStyle.PostActions}>
                    <button className={ModalStyle.ModalButton} onClick={() => handlePurchase(modalContent?.PostId, modalContent?.PostPrice)}>Purchase</button><button className={ModalStyle.ModalButton} onClick={closeModal}>Cancel</button>
                  </div>
                );
              default:
                return null;
            }
          })()}
      </Modal>
    </>
  );
};

export default Post;