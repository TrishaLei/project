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
import ProfileStyle from '../assets/styles/profile.module.css'; // Profile.jsx Main CSS
import PostModel from "../assets/styles/PostModel.module.css";
import ModalStyle from "../assets/styles/modal.module.css";

//Custom alert Components
import AlertComponent from '../components/Alert/AlertComponent.jsx';
import { showAlert } from '../components/Alert/ShowAlert.js';

const Profile = () => {
  //System Variables && Parameters from URL
  const { username } = useParams();
  const navigate = useNavigate();

  // User Server Data Variables
  const [user, setUser] = useState(null);
  const [userIdMe, setUserIdMe] = useState(null);

  // Posts Variables
  const [posts, setPosts] = useState([]);
  const [showAttachments, setShowAttachments] = useState({});
  const [SubscribeModal, setSubscribeModal] = useState(false);
  const [SubscribeModalContent, setSubscribeModalContent] = useState(null);
  const [PremiumModal, setPremiumModal] = useState(false);
  const [PremiumModalContent, setPremiumModalContent] = useState(null);

  // Custom alert variables
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [alertVisible, setAlertVisible] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const userData = GetCookie('data');
    if (userData) {
      setUserIdMe(userData.id);
    }
  }, []);

  useEffect(() => {
      fetch(`http://localhost:5000/user/${username}`, {
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
          setUser(data);
          return data.id;
        }
      })
      .then(userId => {
        if (userId) {
          fetch(`http://localhost:5000/user/${userId}/posts`, {
            method: 'GET', 
            headers: {
              'Content-Type': 'application/json',
            }
          })
          .then(response => response.json())
          .then(data => setPosts(data))
          .catch(error => console.error('Error fetching user posts:', error));
        }
      })
      .catch(error => console.error('Error fetching user data:', error));
  }, [username]);

  // User Interactions
  const handleFollow = async (Authorname) => {
    try {
      const userData = GetCookie('data');
      if (!userData) {
        showAlert(setAlert, setAlertVisible, 'error', 'Please login first!');
        return;
      }
      const response = await fetch(`http://localhost:5000/user/follow/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${userData.token}`
        },
        body: JSON.stringify({ Authorname:Authorname, userid:userData.id }),
      });
      if (response.ok) {
        const updatedUserData = await response.json();
        setUser(updatedUserData);
      }
    } catch (error) {
      console.error('Error downvoting post:', error);
    }
  };

  const handleSubscribe = async (Authorname, Checker) => {
    try {
      const userData = GetCookie('data');
      if (!userData) {
        showAlert(setAlert, setAlertVisible, 'error', 'Please login first!');
        return;
      }
      const response = await fetch(`http://localhost:5000/user/subscribe/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${userData.token}`
        },
        body: JSON.stringify({ Authorname:Authorname, userid:userData.id }),
      });
      if (response.ok) {
        const updatedUserData = await response.json();
        window.dispatchEvent(new Event('userDataUpdate'));
        setUser(updatedUserData);
        if(Checker){
          showAlert(setAlert, setAlertVisible, 'success', `Successfully Subscribed to ${Authorname}!`);
        }
        setSubscribeModal(false);

        await fetch(`http://localhost:5000/user/${user.id}/posts`)
        .then(response => response.json())
        .then(data => setPosts(data))
        .catch(error => console.error('Error fetching user posts:', error));
      }else if(response.status === 401){
        const data = await response.json();
        showAlert(setAlert, setAlertVisible, 'error', data.message);
        setSubscribeModal(false);
      }else{
        console.error('Error:', response);
      }
    } catch (error) {
      console.error('Error downvoting post:', error);
    }
  };

  //Posts Interactions
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
        setPosts(prevPosts => prevPosts.map(post => post.id === postId ? updatedPost : post));
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
        setPosts(prevPosts => prevPosts.map(post => post.id === postId ? updatedPost : post));
      }
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
          setPosts(prevPosts => prevPosts.map(post => post.id === PostID ? updatedPost : post));
          window.dispatchEvent(new Event('userDataUpdate'));
          showAlert(setAlert, setAlertVisible, 'success', 'Purchase successful!');
          setPremiumModal(false)
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
  const SubscribeContent = (AuthorName, AuthorId, SubscriptionPrice, Checker) => {
    const userData = GetCookie('data');
    if (!userData) {
      showAlert(setAlert, setAlertVisible, 'error', 'Please login first!');
      return;
    }
    setSubscribeModal(true);
    setSubscribeModalContent({AuthorName, AuthorId, SubscriptionPrice, Checker});
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
  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <AlertComponent alert={alert} setAlert={setAlert} alertVisible={alertVisible} />
      <div className={ProfileStyle.ProfileContainer}>
        <div className={ProfileStyle.ProfileHeader}>
          <img src={`http://localhost:5000/avatar/${user.id}`} alt="User" className={ProfileStyle.ProfileAvatar} />
          <div className={ProfileStyle.ProfileInfo}>
            <h1>{user.username}</h1>
            <div className={ProfileStyle.Information}>
              <p>Joined: {new Date(user.JoinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' })}</p>
              <p>{user.followers.length > 1 ? `${user.followers.length} Followers`: `${user.followers.length} Follower`} • {user.subscribers.length > 1 ? `${user.subscribers.length} Subscribers`: `${user.subscribers.length} Subscriber`} • {posts.length > 1 ? `${posts.length} Posts`: `${posts.length} Post`}</p>
            </div>
            {user.id !== userIdMe ? (
              <div className={ProfileStyle.ProfileActions}>  
                <button className={ProfileStyle.ProfileActionsFollowButton} onClick={() => handleFollow(user.username)}>{user.followers.includes(userIdMe) ? 'Unfollow' : 'Follow'}</button>
                {Number(user.subscriptionprice) !== 0 && (
                  user.subscribers.includes(userIdMe) ? (
                    <button className={ProfileStyle.ProfileActionsSubscribeButton} onClick={() => handleSubscribe(user.username, false)}>
                      {user.subscribers.includes(userIdMe) ? 'Unsubscribe' : `Subscribe for $${user.subscriptionprice.toFixed(2)}`}
                    </button>
                  ) : (
                    <button className={ProfileStyle.ProfileActionsSubscribeButton} onClick={() => SubscribeContent(user.username, user.id, user.subscriptionprice, true)}>
                      {user.subscribers.includes(userIdMe) ? 'Unsubscribe' : `Subscribe for $${user.subscriptionprice.toFixed(2)}`}
                    </button>
                  )
                )}
              </div>
            ) : null}
          </div>
        </div>
          
        <div className={ProfileStyle.ProfilePosts}>
          <h2>Posts</h2>
          {posts.length === 0 ? (
              <div className={PostModel.Post}>
                <p>No posts available</p>
              </div>
          ) : (
            posts.map(post => (
              <section id={post.id} key={post.id} className={`${PostModel.Post} ${getClassName(post.contentType)}`}>
                <div className={PostModel.PostHeader}>
                  <h2 className={PostModel.PostTitle}>{post.title}</h2>
                  <span className={PostModel.PostTimestamp}>
                    {differenceInYears(new Date(), new Date(post.PostDate)) >= 1
                      ? format(new Date(post.PostDate), 'MMMM d, yyyy')
                      : formatDistanceToNow(new Date(post.PostDate), { addSuffix: true })}
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
                          {post.subscribers.includes(userIdMe) || (post.userId == userIdMe) ? (
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
                              <button className={PostModel.PostActionsButton} onClick={() => SubscribeContent(user.username, user.id, user.subscriptionprice,true)}>Subscribe</button>
                            </div>
                          )}
                          <div className={PostModel.PostActions}>
                          <button onClick={() => handleUpvote(post.id)} className={`${PostModel.PostActionsButton} ${PostModel.ButtonVote} ${post.upvotes.includes(userIdMe) ? PostModel.ButtonVoted : ''}`}>
                            <img src={UpArrow} alt="Upvote" />
                          </button>
                          <p>{post.upvotes.length - post.downvotes.length}</p>
                          <button onClick={() => handleDownvote(post.id)} className={`${PostModel.PostActionsButton} ${PostModel.ButtonVote} ${post.downvotes.includes(userIdMe) ? PostModel.ButtonVoted : ''}`}>
                            <img src={DownArrow} alt="Downvote" />
                          </button>
                        </div>
                        </>
                      );
                    case 2:
                      return (
                        <>
                          {post.purchase.includes(userIdMe) || (post.userId == userIdMe) ? (
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
                            <button onClick={() => handleUpvote(post.id)} className={`${PostModel.PostActionsButton} ${PostModel.ButtonVote} ${post.upvotes.includes(userIdMe) ? PostModel.ButtonVoted : ''}`}>
                              <img src={UpArrow} alt="Upvote" />
                            </button>
                            <p>{post.upvotes.length - post.downvotes.length}</p>
                            <button onClick={() => handleDownvote(post.id)} className={`${PostModel.PostActionsButton} ${PostModel.ButtonVote} ${post.downvotes.includes(userIdMe) ? PostModel.ButtonVoted : ''}`}>
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
                          <button onClick={() => handleUpvote(post.id)} className={`${PostModel.PostActionsButton} ${PostModel.ButtonVote} ${post.upvotes.includes(userIdMe) ? PostModel.ButtonVoted : ''}`}>
                            <img src={UpArrow} alt="Upvote" />
                          </button>
                          <p>{post.upvotes.length - post.downvotes.length}</p>
                          <button onClick={() => handleDownvote(post.id)} className={`${PostModel.PostActionsButton} ${PostModel.ButtonVote} ${post.downvotes.includes(userIdMe) ? PostModel.ButtonVoted : ''}`}>
                            <img src={DownArrow} alt="Downvote" />
                          </button>
                        </div>
                        </>
                      );
                  }
                })()}
              </section>
            ))
          )}
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
              <img src={ `http://localhost:5000/avatar/${PremiumModalContent?.AuthorId}`}  style={{margin: '0 0.25rem', width: '15px', height: '15px', borderRadius: '50%', overflow: 'hidden', display: 'inline-flex', justifyContent: 'center', alignItems: 'center'}} alt="User" />
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
          <Button key="submit" type="primary" onClick={() => handleSubscribe(SubscribeModalContent?.AuthorName, SubscribeModalContent?.Checker)}>
            Confirm
          </Button>,
        ]}
      >
        <div>
            <div className={ModalStyle.Post}>
              <p className={ModalStyle.ModalTitle}>{SubscribeModalContent?.PostTitle}</p>
              <div className={ModalStyle.ModalAuthor}>
                <div className={ModalStyle.ModalTitle}>
                  <img src={ `http://localhost:5000/avatar/${SubscribeModalContent?.AuthorId}`}  style={{margin: '0 0.25rem', width: '24px', height: '24px', borderRadius: '50%', overflow: 'hidden', display: 'inline-flex', justifyContent: 'center', alignItems: 'center'}} alt="User" />
                  <div className={ModalStyle.Bold}  style={{fontSize: '1rem'}}>{SubscribeModalContent?.AuthorName}</div>
                </div>
              </div>
            </div>
          </div>
          <div>Price: <strong>${SubscribeModalContent?.SubscriptionPrice}</strong></div>
        <p>Are you sure you want to subscribe to {SubscribeModalContent?.AuthorName}?</p>
      </Modal>
    </>
  );
};

export default Profile;