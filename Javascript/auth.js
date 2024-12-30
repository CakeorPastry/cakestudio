const urlParams = new URLSearchParams(window.location.search);
const tokenParam = urlParams.get("token");
const redirectParamRaw = urlParams.get("redirect") || "/";
const redirectParam = (redirectParamRaw.startsWith("/") ? redirectParamRaw : "/" + redirectParamRaw);


async function callback() {
    if (tokenParam) {
        try {
            const response = await fetch(`https://cakestudio.onrender.com/api/auth/validatetoken?token=${encodeURIComponent(tokenParam)}`);
            const data = await response.json();
            
            if (!response.ok) {
                throw {
                    status: response.status, 
                    message: "Invalid login or tampering detected."
                };
            }
            localStorage.setItem("token", tokenParam);
        }
        catch (err) {
            const errMsg = `Failed to login\nHTTP Status Code : ${err.status}\nError Message : ${err.message}`
            console.error(errMsg);
            alert(errMsg);
        }
        finally {
            redirect(); 
        }
    }
    else {
        redirect();
    }
};

function redirect() {
    const redirectUrl = `https://cakeorpastry.netlify.app${redirectParam}`;
    window.location.href = redirectUrl;
};

callback();