// setTimeout(() => {
//     console.clear()
// }, 800);
// setTimeout(() => {
//     console.clear()
// }, 2000);
// setTimeout(() => {
//     console.clear()
// }, 4000);

var username = null
var active = {
    username: null,
    displayName: document.getElementById('contact-name'),
    img: document.getElementById('contact-img')
}
var isLoadingMessage = false

function getAvatar(username) {
    return `https://avatars.dicebear.com/api/adventurer-neutral/${username}.svg`
}

const __twoDigitString = num => num < 10 ? `0${num}` : `${num}`

/**
 * 
 * @param {Date} date 
 */
function getUTCNUMERIC(date) {
    const y = __twoDigitString(date.getUTCFullYear())
    const m = __twoDigitString(date.getUTCMonth() + 1)
    const d = __twoDigitString(date.getUTCDate())
    const H = __twoDigitString(date.getUTCHours())
    const M = __twoDigitString(date.getUTCMinutes())
    const S = __twoDigitString(date.getUTCSeconds())
    return y + m + d + H + M + S
}

/**
 * 
 * @param {string} date UTCNUMBERIC 
 * @returns {Date} Datetime
 */
function getDateTime(date) {
    a = date
    return new Date(Date.UTC(a.slice(0, 4), parseInt(a.slice(4, 6)) - 1, a.slice(6, 8), a.slice(8, 10), a.slice(10, 12), a.slice(12, 14)))
}

function activeChat(a) {
    document.querySelector('.message-input input').focus()
    const ul = document.querySelector('.messages ul')
    if (a.id == this.active.username) return ul.lastChild ? ul.lastChild.scrollIntoView() : false;
    else {
        this.isLoadingMessage = false
        socket.emit('loadMessage', a.id, null)
        ul.innerHTML = ''
        all = document.getElementsByClassName('contact')
        for (const e of all) e.className = 'contact'
        a.className = 'contact active'
        this.active.username = a.id
        this.active.displayName.innerHTML = a.querySelector('.name').innerHTML + '[@' + (a.id).replace('chatX','') + ']'
        this.active.img.src = getAvatar(a.id)
    }
    if (ul.lastChild) {
        setTimeout(() => {
            ul.lastChild.scrollIntoView();
        }, 1000);
        setTimeout(() => {
            ul.lastChild.scrollIntoView();
        }, 1100);
    }
}

const createContactElement = (displayName, username, isOnline) => {
    return `<li class="contact" id='${username}' onclick='activeChat(this)'>
                <div class="wrap">
                    <span id="${username}-status" class="contact-status ${isOnline ? 'online' : 'offline'}"></span>
                    <img src="${getAvatar(username)}" alt="" />
                    <div class="meta">
                        <p class="name">${displayName}</p>
                        <p class="preview">Let's start message</p>
                    </div>
                </div>
            </li>`
}

async function sendMessage() {
    const messageElement = await inputMessage.querySelector('.wrap input')
    const message = await messageElement.value
    messageElement.value = ''
    if (message.trim() == '') return false;
    if (this.active.username == null) return alert('Select contact for chating...');
    data = {
        to: this.active.username,
        content: message,
        time: getUTCNUMERIC(new Date())
    };
    socket.emit('sendMessage', data)
}

/**
 * 
 * @param {string} message 
 * @param {'sent'|'replies'} mode 
 * @param {Date | null} time
 */
async function createMessage(message, mode, time = null, dbID = null, addFirst = false) {
    if (message.trim() == '') return false;

    const node = document.createElement('li')
    node.className = mode;
    node.title = time;
    node.setAttribute('dbID', dbID)

    const img = document.createElement('img')
    img.src = getAvatar(mode == 'sent' ? this.username : this.active.username)

    const p = document.createElement('p')
    p.innerHTML = message

    node.appendChild(img)
    node.appendChild(p)

    const ul = document.querySelector('.messages ul')

    if (!addFirst) {
        ul.appendChild(node)
        node.scrollIntoView()
        // console.log('scroll',node);
    } else {
        ul.insertBefore(node, ul.firstChild)
    }

}

/**
 * 
 * @param {*} message 
 * @param {*} username 
 */
function previewMessage(message, username) {
    const contact = document.querySelector(`#${username} .wrap .meta .preview`)
    contact.innerHTML = message.slice(0, 50)
}


function moveToTop(e) {
    const parent = e.parentElement
    e.remove()
    parent.insertBefore(e, parent.firstChild)
}

const box = document.querySelector('.messages')
box.addEventListener('scroll', async e => {
    let scrolled = box.scrollTop;
    if (scrolled <= 1) {
        if (!this.isLoadingMessage) {
            this.isLoadingMessage = true
            const chatID = box.querySelector('ul li').getAttribute('dbID')
            await socket.emit('loadMessage', this.active.username, chatID ? chatID : null);
        }
    }
});




var socket = io.connect({ query: { token: getCookie('jwt') } });

const inputMessage = document.querySelector('.message-input')
const contacts = document.getElementById('contact-container')
const profilePic = document.getElementById('profile-img')
const profileName = document.getElementById('profile-name')

socket.on('connect', () => {
    console.log('connected');
});

socket.on('allUser', async (users, self) => {
    // console.log(users);
    users.forEach(element => {
        if (element.username != self) {
            const node = document.createElement('li')
            node.innerHTML = createContactElement(element.displayName, element.username, false)
            contacts.appendChild(node)
            socket.emit('getlastMessage', self, element.username)

        } else {
            profilePic.src = getAvatar(self)
            profileName.innerHTML = element.displayName
            this.username = self
        }
    });
});

socket.on('updatelastMessage', a => {
    // console.log('update', a);
    if (!a) return false
    const s = document.querySelector(`#${a.sender}`)
    const r = document.querySelector(`#${a.resiver}`)
    const e = (s ? s : r).querySelector('.wrap .meta .preview').innerHTML = a.content;
})

socket.on('setStatus', (username, status, socketID) => {
    if (status == 'offline' && username == this.username) {
        socket.emit('restatus', this.username)
    } else if (username != this.username) {
        const s = document.getElementById(`${username}-status`)
        s.className = `contact-status ${status}`
    }

    if (socketID != null)
        socket.emit('greetingNewConnection', this.username, socketID)

});

socket.on('sentMessage', data => {
    const mode = data.sent ? 'sent' : 'replies'
    const x = data.sent ? data.sent : data.replies;
    console.log(data);

    if (data.sent) {
        previewMessage('Me: ' + x.content, x.to)
        moveToTop(document.getElementById(x.to).parentElement)
    }
    else {
        previewMessage(x.content, x.from)
        moveToTop(document.getElementById(x.from).parentElement)
    }

    if (x.to == this.active.username || x.from == this.active.username)
        createMessage(x.content, mode, getDateTime(x.time), x.dbID)

})

socket.on('loadedMessage', data => {
    data.sort((a, b) => a.id < b.id).forEach(async e => {
        await createMessage(e.content, e.sender == this.username ? 'sent' : 'replies', getDateTime(`${e.time}`), e.id, true)
    })
    this.isLoadingMessage = false
})

socket.on('disconnect', () => window.location.reload())