import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate} from 'react-router-dom';
import { format, formatDistanceToNow, differenceInYears } from 'date-fns';
import UpArrow from "../assets/images/arrow-big-up.svg";
import DownArrow from "../assets/images/arrow-big-down.svg";
import ProfileStyle from '../assets/styles/profile.module.css';
import PostModel from "../assets/styles/PostModel.module.css";
import { GetCookie } from '../components/auth/cookies.jsx';
import AlertComponent from '../components/Alert/AlertComponent.jsx';
import { showAlert } from '../components/Alert/ShowAlert.js';
import Modal from '../components/Modal/Modal.jsx';

const Profile = () => {
  const { username } = useParams();
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [alertVisible, setAlertVisible] = useState(false);
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [userIdMe, setUserIdMe] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const userData = GetCookie('data');
    if (userData) {
      setUserIdMe(userData.id);
    }
  }, []);

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

  useEffect(() => {
    fetch(`http://localhost:5000/user/${username}`)
      .then(response => response.json())
      .then(data => {
        if (data.length === 0) {
          navigate('/');
        } else {
          setUser(data[0]);
          return data[0].id;
        }
      })
      .then(userId => {
        if (userId) {
          fetch(`http://localhost:5000/user/${userId}/posts`)
            .then(response => response.json())
            .then(data => setPosts(data))
            .catch(error => console.error('Error fetching user posts:', error));
        }
      })
      .catch(error => console.error('Error fetching user data:', error));
  }, [username]);

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

  const openModal = (content) => {
    setModalContent(content);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent(null);
  };

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
            <p>{user.followers.length > 0 ? `${user.followers.length} Followers`: `${user.followers.length} Follower`} • {user.subscribers.length > 0 ? `${user.subscribers.length} Subscribers`: `${user.subscribers.length} Subscriber`} • {posts.length > 0 ? `${posts.length} Posts`: `${posts.length} Post`}</p>
          </div>
          <div className={ProfileStyle.ProfileActions}>  
            <button className={ProfileStyle.ProfileActionsFollowButton} onClick={() => openModal('Subscribe')}>Follow</button>
            <button className={ProfileStyle.ProfileActionsSubscribeButton} onClick={() => openModal('Subscribe')}>Subscribe</button>
          </div>
        </div>
      </div>
      <div className={ProfileStyle.ProfilePosts}>
        <h2>Posts</h2>
        {posts.length === 0 ? (
            <p>No posts available</p>
          ) : (
            posts.map(post => (
              <div key={post.id} className={`${PostModel.Post} ${getClassName(post.contentType)}`}>
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
                  <Link className={PostModel.PostAuthorName}>
                    <span>{post.username}</span>
                  </Link>
                </p>
                {(() => {
                  switch (post.contentType) {
                    case 1:
                      return (
                        <>
                          <div className={PostModel.PostActions}>  
                            <button className={PostModel.PostActionsButton} onClick={() => openModal('Subscribe')}>Subscribe</button>
                          </div>
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
                          <p className={PostModel.PostPrice}>${post.price.toFixed(2)}</p>
                          <div className={PostModel.PostActions}>  
                            <button className={PostModel.PostActionsButton} onClick={() => openModal('Buy Now')}>Buy Now</button>
                          </div>
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
                        <div className={PostModel.PostActions}>
                          <button onClick={() => handleUpvote(post.id)} className={`${PostModel.PostActionsButton} ${PostModel.ButtonVote} ${post.upvotes.includes(userIdMe) ? PostModel.ButtonVoted : ''}`}>
                            <img src={UpArrow} alt="Upvote" />
                          </button>
                          <p>{post.upvotes.length - post.downvotes.length}</p>
                          <button onClick={() => handleDownvote(post.id)} className={`${PostModel.PostActionsButton} ${PostModel.ButtonVote} ${post.downvotes.includes(userIdMe) ? PostModel.ButtonVoted : ''}`}>
                            <img src={DownArrow} alt="Downvote" />
                          </button>
                        </div>
                      );
                  }
                })()}
              </div>
            ))
          )}
      </div>
    </div>
    <Modal show={isModalOpen} onClose={closeModal}>
      <h2>{modalContent}</h2>
      <p>Here you can add more details about the {modalContent} action.</p>
    </Modal>
    </>
  );
};

export default Profile;