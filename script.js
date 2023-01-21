const addBox = document.querySelector(".add-box"),
popupBox = document.querySelector(".popup-box"),
popupTitle = popupBox.querySelector("header p"),
closeIcon = popupBox.querySelector("header i"),
titleTag = popupBox.querySelector("input"),
descTag = popupBox.querySelector("textarea"),
addBtn = popupBox.querySelector("button");

const months = ["January", "February", "March", "April", "May", "June", "July",
              "August", "September", "October", "November", "December"];
const notes = JSON.parse("[]");
let isUpdate = false, updateId;



addBox.addEventListener("click", () => {
    popupTitle.innerText = "Add a new Note";
    addBtn.innerText = "Add Note ";
    popupBox.classList.add("show");
    document.querySelector("body").style.overflow = "hidden";
    if(window.innerWidth > 660) titleTag.focus();
});

closeIcon.addEventListener("click", () => {
    isUpdate = false;
    titleTag.value = descTag.value = "";
    popupBox.classList.remove("show");
    document.querySelector("body").style.overflow = "auto";
});



function showNotes() {
    if(!notes) return;
    document.querySelectorAll(".note").forEach(li => li.remove());
    document.querySelector(".noteloading-box")?.remove();
    notes.forEach((note, id) => {
        let filterDesc = note.description.replaceAll("\n", '<br/>');
        let liTag = `<li class="note">
                        <div class="details">
                            <p>${note.title}</p>
                            <span>${filterDesc}</span>
                        </div>
                        <div class="bottom-content">
                            <span>${note.date}</span>
                            <div class="settings">
                                <i onclick="showMenu(this)" class="uil uil-ellipsis-h"></i>
                                <ul class="menu">
                                    <li onclick="updateNote('${note.id}', '${note.title}', '${filterDesc}')"><i class="uil uil-pen"></i>Edit</li>
                                    <li onclick="deleteNote('${note.id}')"><i class="uil uil-trash"></i>Delete</li>
                                </ul>
                            </div>
                        </div>
                    </li>`;
        addBox.insertAdjacentHTML("afterend", liTag);
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function initial(){
    const container = document.querySelectorAll(".wrapper")
    let liLoading = `<div class="noteloading-box" style="">
    <div style="">
                        <i class="fa fa-spinner fa-spin" style="" ></i>
                        </div>
                    </div>`;
                    addBox.insertAdjacentHTML("afterend", liLoading);     
                
   await fetch('https://backendnote.onrender.com/employees')
  .then(response => response.json())
//   .then(async e=>{await sleep(2000)
// return e})
  .then(data => {
      console.log(data)
        for (let e of data) {
            temp = {
                title: e.title,
                description: e.description,
                date:e.date,
                id:e._id}
        notes.push(temp)
        }
        showNotes()
    });
}
initial()


function showMenu(elem) {
    elem.parentElement.classList.add("show");
    document.addEventListener("click", e => {
        if(e.target.tagName != "I" || e.target != elem) {
            elem.parentElement.classList.remove("show");
        }
    });
}
function findindex(arr, id){
    for (let i = 0; i<arr.length; i++){
        if(arr[i].id == id)
            return i
    }
    return -1
}

async function deleteNote(noteId) {
    let confirmDel = confirm("Are you sure you want to delete this note?");
    if(!confirmDel) return;
    let index = findindex(notes, noteId)
    console.log("index ", index)
    notes.splice(index, 1);
    await fetch('https://backendnote.onrender.com/employee/'+noteId, {
            method: 'DELETE', // or 'PUT'
            headers: {
                'Content-Type': 'application/json',
            }
            })
            .then(response => response.json())
            .then(data => {
            console.log('Success:', data);

            })
            .catch((error) => {
            console.error('Error:', error);
            });
    showNotes();
}

async function updateNote(noteId, title, filterDesc) {
    let description = filterDesc.replaceAll('<br/>', '\r\n');
    updateId = noteId;
    isUpdate = true;
    addBox.click();
    titleTag.value = title;
    descTag.value = description;
    popupTitle.innerText = "Update a Note";
    addBtn.innerText = "Update Note ";
}



addBtn.addEventListener("click", async (e) => {
    e.target.disabled = true
    //<i class="fa fa-spinner fa-spin"></i>
    const loading = document.createElement("i")
    loading.classList.add('fa','fa-spinner','fa-spin')
    // e.classList.add("show");
    let submitbutton = document.querySelector('form button ')
    submitbutton.classList.add('disable')
    submitbutton.appendChild(loading)
    // console.log([x])
    e.preventDefault()
    let title = titleTag.value.trim(),
    description = descTag.value.trim();

    if(title || description) {
        let currentDate = new Date(),
        month = months[currentDate.getMonth()],
        day = currentDate.getDate(),
        year = currentDate.getFullYear();

        let noteInfo = {title, description, date: `${month} ${day}, ${year}`}
        if(!isUpdate) {
            notes.push(noteInfo);
            await fetch('https://backendnote.onrender.com/employee', {
            method: 'POST', // or 'PUT'
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(noteInfo),
            })
            .then(response => response.json())
            .then(data => {
            console.log('Success:', data);
            notes[notes.length-1].id = data._id
            })
            .catch((error) => {
            console.error('Error:', error);
            });
             
            console.log(notes[notes.length-1])
        } else {
            isUpdate = false;
            let index = findindex(notes,updateId)
            notes[index] = noteInfo;
            await fetch('https://backendnote.onrender.com/employee/'+updateId, {
            method: 'POST', // or 'PUT'
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(noteInfo),
            })
            .then(response => response.json())
            .then(data => {
            console.log('Success:', data);
            notes[index].id = data._id

            })
            .catch((error) => {
            console.error('Error:', error);
            });
        }
        // localStorage.setItem("notes", JSON.stringify(notes));
        console.log(JSON.stringify(notes))
        
        showNotes();
        e.target.disabled = false
        submitbutton.classList.remove('disable')
        closeIcon.click();
    }
});
