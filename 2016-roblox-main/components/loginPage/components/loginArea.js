import { useRef, useState } from "react";
import { createUseStyles } from "react-jss";
import { login } from "../../../services/auth";
import useButtonStyles from "../../../styles/buttonStyles";
import ActionButton from "../../actionButton";
import getFlag from "../../../lib/getFlag";
import GetCookie from "./getCookie";
import { useEffect } from "react";
const loginThroughCookieRequired = getFlag('requireLoginThroughCookie', true);
import axios from 'axios';

const useStyles = createUseStyles({
    discordDivider: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        color: '#777',
        fontSize: '13px',
        margin: '16px 0 12px 0',
        '&::before, &::after': {
            content: '""',
            flex: 1,
            height: '1px',
            background: '#ddd',
        },
    },
    discordButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        width: '100%',
        padding: '9px 12px',
        border: 'none',
        borderRadius: '3px',
        background: '#5865F2',
        color: '#fff',
        fontSize: '15px',
        fontWeight: 600,
        cursor: 'pointer',
        '&:hover': {
            background: '#4752C4',
        },
    },
    discordLogo: {
        width: '20px',
        height: '20px',
        fill: '#fff',
    },
    header: {
        fontSize: '35px',
    },
    input: {
        width: 'calc(100% - 90px)',
        display: 'inline-block',
    },
    inputLabel: {
        width: '90px',
        display: 'inline-block',
        color: '#343434',
    },
    signInButtonWrapper: {
        float: 'right',
    },
    loginWrapper: {
        maxWidth: '325px',
    }
});

const sendLoginRequest = async (value) => {
    let csrf = '';
    let csrfRetires = 0;
    while (true) {
        if (csrfRetires >= 3)
            throw new Error('Csrf failure after max retries - are cookies enabled?');

        try {
            return await axios.post('/api/validate-and-add-cookie', {
                cookie: value,
            }, {
                headers: {
                    'x-csrf-token': csrf,
                },
            });
        }catch(e) {
            const result = e.response;
            if (result) {
                if (result.status === 403 && result.headers['x-csrf-token']) {
                    csrf = result.headers['x-csrf-token'];
                    csrfRetires++
                    continue;
                }
            }
            throw e;
        }

    }
}

const LoginArea = props => {
    const buttonStyles = useButtonStyles();
    const s = useStyles();
    const usernameRef = useRef(null);
    const passwordRef = useRef(null);
    const cookieRef = useRef(null);
    const [locked, setLocked] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [showCookieTutorial, setShowCookieTutorial] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const loginmsg = params.get('loginmsg');
        if (loginmsg) {
            setFeedback(decodeURIComponent(loginmsg));
        }
    }, []);

    const onLoginWithDiscordClick = e => {
        window.location.href = '/login-with-discord';
    }

    const onLoginClick = e => {
        setFeedback(null);
        if (loginThroughCookieRequired || cookieRef.current.value) {
            let value = cookieRef.current.value.trim();
            if (value.startsWith('.ROBLOSECURITY=')) {
                value = value.slice(15);
            }
            if (!value.startsWith('_|WARNING:-DO-NOT-SHARE-THIS.--Sharing-this-will-allow-someone-to-log-in-as-you-and-to-steal-your-ROBUX-and-items.|')) {
                setFeedback('This cookie does not look valid. It should start with "_|WARNING:-DO-NOT-SHARE".');
                return;
            }
            setLocked(true);
            // We use an api instead of document.cookie so that it can be httponly
            sendLoginRequest(value).then(() => {
                window.location.href = '/home';
            })
            return;
        }

        setLocked(true);
        login({
            username: usernameRef.current.value,
            password: passwordRef.current.value,
        }).then(() => {
            window.location.href = '/home';
        }).catch(e => {
            setFeedback(e.response?.data?.errors[0]?.message || e.message);
        }).finally(() => {
            setLocked(false);
        })
    }

    return <div className='row'>
        {
            showCookieTutorial ? <GetCookie setVisible={setShowCookieTutorial} /> : null
        }
        <div className='col-12'>
            <h1 className={s.header}>Login to Homoru</h1>
            {feedback && <p className='mb-2 mt-1 text-danger'>{feedback}</p>}
        </div>
        <div className='col-12'>
            <div className={'ms-4 me-4 ' + s.loginWrapper + ' ' + (loginThroughCookieRequired ? s.loginWrapperCookie : '')}>
                {
                    loginThroughCookieRequired ? <>
                        <div>
                            <p className='fw-bold me-4 mb-0'>.ROBLOSECURITY Cookie:</p>
                            <p className='mb-2'>
                                <a href='#' className='fst-italic' onClick={e => {
                                    e.preventDefault();
                                    setShowCookieTutorial(true);
                                }}>
                                    How do I get this?
                                </a>
                            </p>
                        </div>
                        <div>
                            <textarea disabled={locked} rows={7} className='w-100' ref={cookieRef} />
                        </div>
                    </> : <>
                        <div>
                            <div className={s.inputLabel}>
                                <p className='fw-bold me-4'>Username:</p>
                            </div>
                            <div className={s.input}>
                                <input disabled={locked} type='text' className='w-100' ref={usernameRef}></input>
                            </div>
                        </div>
                        <div className='mt-2'>
                            <div className={s.inputLabel}>
                                <p className='fw-bold me-4'>Password:</p>
                            </div>
                            <div className={s.input}>
                                <input disabled={locked} type='password' className='w-100' ref={passwordRef}></input>
                            </div>
                        </div>
                    </>
                }
                <div className='mt-2'>
                    <div className={s.signInButtonWrapper}>
                        <ActionButton disabled={locked} label='Sign In' className={buttonStyles.continueButton} onClick={onLoginClick}></ActionButton>
                    </div>
                </div>
            </div>
            <div className={'ms-4 me-4 ' + s.loginWrapper}>
                <div className={s.discordDivider}>or</div>
                <button disabled={locked} className={s.discordButton} onClick={onLoginWithDiscordClick}>
                    <svg className={s.discordLogo} viewBox="0 0 127.14 96.36">
                        <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/>
                    </svg>
                    Login with Discord
                </button>
            </div>
        </div>

    </div>
}

export default LoginArea;