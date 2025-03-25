import { useState,  useEffect } from "react";
import { Form, Link, useNavigate } from "react-router-dom";
import { Alert } from 'antd';
import PostStyle from "../assets/styles/post.module.css";
import FormStyle from "../assets/styles/form.module.css";
import { GetCookie, RemoveCookie } from '../components/auth/cookies.jsx';
import AlertComponent from '../components/Alert/AlertComponent.jsx';
import { showAlert } from '../components/Alert/ShowAlert.js';

const Post = () => {
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [description, setDescription] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [contentType, setContentType] = useState(0);
  const [showPriceInput, setShowPriceInput] = useState(false);
  const [price, setPrice] = useState(0.0);
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [alertVisible, setAlertVisible] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [hasAttachment, setHasAttachments] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = GetCookie('data');
    if (!userData) {
      navigate('/');
    }
  }, [navigate]);

  const handlePaidChange = () => {
    setIsPaid(!isPaid);
    setShowPriceInput(false);
    setContentType(0);
  };

  const handleSubscriptionClick = () => {
    setShowPriceInput(false);
    setContentType(1);
  };

  const handlePriceBaseClick = () => {
    setShowPriceInput(true);
    setContentType(2);
  };

  const handleAttachmentsChange = (e) => {
    setAttachments(e.target.files);
    setHasAttachments(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userData = GetCookie('data');
    if (!userData) {
      navigate('/');
      return;
    }
    const username = userData.username;
    const usertoken = userData.token;
    const PostDate = new Date().toISOString();
    try {
      const formData = new FormData();
      formData.append('usertoken', usertoken);
      formData.append('username', username);
      formData.append('title', title);
      formData.append('tags', tags);  
      formData.append('description', description);
      formData.append('contentType', contentType);
      formData.append('price', price);
      formData.append('hasAttachments', hasAttachment);
      formData.append('PostDate', PostDate);


      if (attachments.length > 0) {
        for (let i = 0; i < attachments.length; i++) {
          formData.append('attachments', attachments[i]);
        }
      }

      const response = await fetch('http://localhost:5000/publish', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        showAlert(setAlert, setAlertVisible, 'success', 'Successfuly published!');
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else if(response.status === 401) {
        showAlert(setAlert, setAlertVisible, 'error', 'Invalid Post. Please try again.');
      }else if(response.status === 500){
        setAlertVisible(true);
        showAlert(setAlert, setAlertVisible, 'error', 'Your account has been logged in from another device. Please login again. You will be redirected to login page in 5 seconds.');
        RemoveCookie('data');
        setTimeout(() => {
          setAlertVisible(false);
          navigate('/login');
        }, 5000);
      }else{
        showAlert(setAlert, setAlertVisible, 'error', 'Server error. Please try again later.');
      }
    } catch (error) {
      console.error('Error:', error);
      showAlert(setAlert, setAlertVisible, 'error', 'Server error. Please try again later.');
    }
  };


  return (
    <>
      <AlertComponent alert={alert} setAlert={setAlert} alertVisible={alertVisible} />
      <main className={PostStyle.Wrapper}>
        <section className={FormStyle.PostFormContainer}>
          <h2>Create a new post</h2>
          <form onSubmit={handleSubmit}>
            <div className={FormStyle.FormGroup}>
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                placeholder="Enter post title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className={FormStyle.FormGroup}>
              <label htmlFor="tags">Tags</label>
              <input
                type="text"
                id="tags"
                name="tags"
                placeholder="Enter tags separated by commas"
                required
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>

            <div className={FormStyle.FormGroup}>
              <label htmlFor="attachments">Attachments</label>
              <input type="file" id="attachments" name="attachments" multiple onChange={handleAttachmentsChange} />
            </div>

            <div className={FormStyle.FormGroup}>
              <label htmlFor="description">Description</label>
              <textarea
                classname={FormStyle.TextArea}
                id="description"
                name="description"
                placeholder="Write your post description here..."
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className={FormStyle.FormGroup}>
              <div className={FormStyle.CheckBox}>
                <p htmlFor="isPaid">Paid Content</p>
                <input
                  type="checkbox"
                  id="isPaid"
                  name="isPaid"
                  onChange={handlePaidChange}
                />
              </div>
            </div>

            {isPaid && (
              <div className={FormStyle.SubPriceButton}>
                <button type="button" onClick={handleSubscriptionClick}>
                  Subscription
                </button>
                <button type="button" onClick={handlePriceBaseClick}>
                  Price base
                </button>
              </div>
            )}

            {showPriceInput && (
              <div className={FormStyle.FormGroup}>
                <label htmlFor="price">Price</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  placeholder="Enter price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            )}

            <button type="submit" className={FormStyle.SubmitBtn}>
              Publish
            </button>
          </form>
        </section>
        <footer className={PostStyle.Footer}>
            <p><Link to="/">EduHub</Link> &copy; 2024. All rights reserved.</p>
        </footer>
      </main>
    </>
  );
};

export default Post;
