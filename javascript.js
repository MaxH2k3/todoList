/*
Page: (idPage, titlePage)
toDos: (idTask, idPage, titleTask, notes, dateCreated, deadline, status)

*/
let listPage = [];  //danh sách cho từng mục tiêu lớn (page)
let listTask = []; //danh sách cho từng todo task nhỏ
let listTodos = [];  //danh sách todo của mỗi page
let currentIdPage = "";
let currentAction = 3;
let isEditPage = false;

//
//
run();


//chạy chương trình
function run() {
    if(localStorage.getItem("listPage") == null) {
        localStorage.setItem("listPage", JSON.stringify(listPage));
        localStorage.setItem("listTask", JSON.stringify(listTask));
        localStorage.setItem("listTodos", JSON.stringify(listTodos));
    } else {
        listPage = JSON.parse(localStorage.getItem("listPage"));
        listTask = JSON.parse(localStorage.getItem("listTask"));
        listTodos = JSON.parse(localStorage.getItem("listTodos"));
    }
    for(const element of listPage) {
        renderForTitle(element);
    }
}

//create class for tasks
class Tasks {
    constructor(idTask = new Date().getTime(), titleTask = "", notes = "", dateCreated = createTime(), deadline = "", status = false) {
        this.idTask = idTask;
        this.titleTask = titleTask;
        this.notes = notes;
        this.dateCreated = dateCreated;
        this.deadline = deadline;
        this.status = status;
    }

    //get tasks
    getIDTask() { return this.idTask; }
    getIDPage() { return this.IdPage; }
    getTitleTask() { return this.titleTask; }
    getNotes() { return this.notes; }
    getDateCreated() { return this.dateCreated; }
    getDeadline() { return this.deadline; }
    getStatus() { return this.status; }
    //set tasks
    setTitleTask(titleTask) { this.titleTask = titleTask; }
    setNotes(notes) { this.notes = notes; }
    setDateCreated(dateCreated) { this.dateCreated = dateCreated; }
    setDeadline(deadline) { this.deadline = deadline; }
    setStatus(status) { this.status = status; }
}

function getIDTask(idTask) {
    for(let i = 0; i < listTask.length; i++) {
        if(listTask[i].idTask == idTask) {
            return i; 
        }
    }       
    return -1;
}

/*create function for pages*/

//create function getPage when page have ID 

function getPage(idPage) {
    for(let i = 0; i < listPage.length; i++) {
        if(listPage[i].id == idPage) {
            return i; 
        }
    }
}

//

/*create function for todos*/


//xử lý dữ liệu
function newList() {
    if(isEditPage) {
        return;
    } 
    let input = document.querySelector('.c-form__input'); //nhận tên user input
    let title = input.value;
    let objects = {
        id: new Date().getTime(),
        title: title
    }
    listPage.push(objects);
    saveToStorage("listPage", listPage);
    renderForTitle(objects);
}

function newTask() {
    //set các giá trị của tasks
    if(currentIdPage == "") {
        createNotification(0);
        return;
    }
    let objTask = new Tasks();
    renderForTask(objTask);
}

function newTodos(idTask) {
    for(const element of listTodos) {
        if(element.idTask == idTask) {
            return;
        }
    }

    let object = {
        idPage: currentIdPage,
        idTask: idTask
    }
    listTodos.push(object);
}

function compareStr(a, b) {
    //xử lý chuỗi a
    a = a.toLocaleLowerCase();
    a = a.replace(" ", "")

    //xử lý chuỗi b
    b = b.toLocaleLowerCase();
    b = b.replace(" ", "")

    return a == b;
}

function createTime() {
    let time = new Date().toLocaleDateString("vi-VI").split("/");
    if(time[0] < 10) time[0] = "0" + time[0];
    if(time[1] < 10) time[1] = "0" + time[1]
    time = time[0] + "/" + time[1] + "/" + time[2];
    return time;
}

function limitTime() {
    let time = new Date().toLocaleDateString("vi-VI").split("/");
    if(time[0] < 10) time[0] = "0" + time[0];
    if(time[1] < 10) time[1] = "0" + time[1]
    time = time[2] + "-" + time[1] + "-" + time[0];
    return time;
}

function editTaskBE(idTask) {
    //lấy giá trị tại lúc bấm nút edit
    let element = document.getElementById(idTask);
    let titleTask = element.querySelector("textarea");
    let notesTask = element.querySelector(".note").querySelector("textarea");
    let title = titleTask.value;
    let notes = notesTask.value;
    //tìm phần tử có tên title task là titletask bên trong listPages
    let objTask = new Tasks(idTask, title, notes, createTime(), "", false)
    let indexTask = getIDTask(idTask);
    if (indexTask == -1) {
        listTask.push(objTask);
    } else {
        listTask[indexTask] = objTask;
    }
    saveToStorage("listTask", listTask);

    //tạo liên kết
    newTodos(idTask);
    saveToStorage("listTodos", listTodos);
}

function statusTask(idTask) {
    let indexTask = getIDTask(idTask);
    if(listTask[indexTask].status) {
        listTask[indexTask].status = false;
        createNotification(2);
    }
    else {
        listTask[indexTask].status = true;  
        createNotification(1);
    }
    let li = document.getElementById(idTask);
    if(currentAction != 3)  li.remove();
    saveToStorage("listTask", listTask);
}

function hideLeftTime(event) {
    let countDown = event.target.querySelector(".countDown").querySelector("p");
    countDown.innerHTML = "";
}

//hàm tải dữ liệu đã lưu từ local
function loadTaskForPages() {
    if(listTask == null) {
        return;
    }

    resetDisplay();

    let listIdTask = listTodos.filter(function(object) {
        return object.idPage == currentIdPage;
    });
    
    for(const element of listIdTask) {
        let objTask = listTask.find(function(objTask){
            if(currentAction == 1) {
                return objTask.idTask == element.idTask && objTask.status == false;
            }
            else if(currentAction == 2) {
                return objTask.idTask == element.idTask && objTask.status == true;
            }
            else {
                return objTask.idTask == element.idTask;
            }
        })

        if(objTask != null) {
            renderForTask(objTask);
        }
    }
}

function changeAction(event) {
    //xóa hiệu ứng cũ
    if(currentAction == event.target.id) {
        return;
    }
    event.target.classList.add("choose");
    let oldButton = document.getElementById(currentAction);
    oldButton.classList.remove("choose");

    //gán giá trị action hiện tại
    currentAction = parseInt(event.target.id);
    loadTaskForPages();
}

function resetDisplay() {
    let ul = document.getElementById('list-todo');
    let liAddTask;
    if(currentAction == 2) {
        liAddTask =
        `<li id = "new-task" style = "background: none;"></li> `
    } else {
        liAddTask = 
        `<li id = "new-task" onclick="newTask()">
            <i class="fa-solid fa-circle-plus"></i>
        </li> ` 
    }
    ul.innerHTML = liAddTask;
}

//lưu và lấy dữ liệu từ local
function saveToStorage(nameObject, listObject) {
    localStorage.setItem(nameObject, JSON.stringify(listObject));
    console.log("SUCCESSFUL");
}

function getDataJSON(storage) {
    return JSON.parse(localStorage.getItem(storage));
}

//phần render cho từng tagname  
function renderForTitle(objPage) {
    let tagName = 
    `<a>${objPage.title}</a>
    <div class="icon">
        <i onclick = "editPage(${objPage.id})" class="fa-solid fa-pen"></i>
        <i onclick = "deleteNameList(${objPage.id})" onclick="deleteNameList(this)" class="fa-solid fa-x"></i>
    </div>`
    let ul = document.getElementById("display-name-list");
    let li = document.createElement('li');
    li.id = objPage.id;
    li.innerHTML = tagName;
    ul.appendChild(li);

    //add sự kiện cho li
    li.addEventListener("click", function(){
        importToTitle(this.id);
    });
}

function renderForTask(objTask) {
    let tagName = `
    <li id = "${objTask.idTask}" onmouseenter="renderForLeftTime(event)" onmouseleave="hideLeftTime(event)">
    <textarea placeholder="New Task" disabled>${objTask.titleTask}</textarea>
    <div class="note">
        <i class="fa-solid fa-align-left"></i>
        <textarea placeholder="New Note" disabled>${objTask.notes}</textarea>
    </div>
    
    <div class = "countDown">
        <p></p>     
    </div>

    <div class="icon">
        <i class="fa-solid fa-clock" onmouseleave="renderForTime(false, ${objTask.idTask})" onmouseenter = "renderForTime(true, ${objTask.idTask})"></i>
        <i onclick="editTaskFE(event)" class="fa-regular fa-file-pen"></i>
        <i onclick="statusTask(${objTask.idTask})" class="fa-regular fa-circle-check"></i>
        <i onclick="deleteTask(${objTask.idTask})" class="fa-solid fa-circle-xmark delete"></i>
    </div>


    <div class = "time" onmouseleave="renderForTime(false, ${objTask.idTask})" onmouseenter = "renderForTime(true, ${objTask.idTask})">
        <table>
            <tr>
                <td>Begin:</td>
                <td class = "startDate">${objTask.dateCreated}</td>
            </tr>
            <tr>
                <td>End:</td>
                <td class = "endDate">
                    <span>${objTask.deadline}</span>
                    <input onchange="formatForTime(this, ${objTask.idTask})" type="date" min = ${limitTime()}>
                </td>
            </tr>
        </table>
    </div>
</li>
    `
    //lấy giá trị li new-task
    let liNewTask = document.getElementById("new-task");
    liNewTask.insertAdjacentHTML("beforebegin", tagName);
}

function renderForTime(status, idTask) {
    let li = document.getElementById(idTask);
    let time = li.querySelector(".time");
    if(status) {
        setTimeout(function() {
            time.style.visibility = "visible";
        }, 100)
    } else {
        time.style.visibility = "hidden";
    }
}

function renderForLeftTime(event) {
    
    //tính toán thời gian còn lại
    //lấy thời gian  kết thúc tính theo milisec
    let deadline = event.target.querySelector(".endDate");
    deadline = deadline.querySelector("span").textContent.split("/");
    deadline = deadline[2] + "-" + deadline[1] + "-" + deadline[0];
    deadline = new Date(deadline).getTime();

    //lấy thời gian hiện tại tính theo milisec
    let currentDay = new Date().getTime();
    
    //tính toán thời gian còn lại và đổi chúng sang ngày
    let leftTime = deadline - currentDay;
    leftTime = leftTime / (1000 * 3600 * 24);
    //set giá trị còn lại vào html và display
    
    let countDown = event.target.querySelector(".countDown").querySelector("p");
    if(isNaN(leftTime)) {
        leftTime = `<i class="fa-solid fa-infinity"></i>`;
    }
    else if(leftTime > 0 && leftTime < 1) {
        leftTime = "Tommorow";
    }
    else if(leftTime <= 0) {
        leftTime = "Time Over";
    } else {
        leftTime = "Left: " + Math.round(leftTime) + " day";
    }
    
    countDown.innerHTML = leftTime;
}

function formatForTime(input, idTask) {
    let span = input.parentElement.querySelector("span");
    let time = input.value.split("-");
    time = time[2] + "/" + time[1] + "/" + time[0];
    console.log(span)
    span.innerHTML = time;
    //xử lý lưu giá trị
    let indexTask = getIDTask(idTask);
    listTask[indexTask].deadline = time;
    saveToStorage("listTask", listTask);
}


//xử lý giao diện

function editTaskFE(event) {
    let liElement = event.target.closest('li');
    let textAreas = liElement.getElementsByTagName('textarea');
    if(liElement.style.boxShadow) {
        liElement.style.removeProperty("box-shadow");
    } else {
        liElement.style.boxShadow = "5px 8px 12px #271c6c";
    }
    if(textAreas[0].disabled && textAreas[1].disabled) {
        textAreas[0].removeAttribute("disabled");
        textAreas[1].removeAttribute("disabled");
    } else {
        textAreas[0].setAttribute("disabled", true);
        textAreas[1].setAttribute("disabled", true);
        console.log(liElement.id);
        editTaskBE(liElement.id);
    }
}

function recoverInputList(event) {
    setTimeout(function() {
        event.preventDefault();
        let form = document.querySelector('.c-form');
        let checkbox = document.querySelector('#checkbox');
        let input = document.querySelector('.c-form__input');
        input.value = '';
        form.classList.remove('active');
        checkbox.checked = false;
    }, 3000)
}

function checkInputList(event) {
    let input = document.querySelector('.c-form__input');
    let form = document.querySelector('.c-form');
    let checkbox = document.querySelector('#checkbox');
    let timer;
    timer = setTimeout(function() {
        if (event.target.value === '' || event.target.value === undefined) {
          form.classList.remove('active');
          checkbox.checked = false;
        }
      }, 10000);

    input.addEventListener('input', function() {
      clearTimeout(timer);
    });
}

function importToTitle(idPage) {
    let input = document.querySelector('.border-animation__inner');
    if(currentIdPage != "")
        input.classList.remove(currentIdPage);
    input.classList.add(idPage);
    let objPage = listPage[getPage(idPage)]; 
    input.innerHTML = objPage.title;
    currentIdPage = idPage;
    loadTaskForPages();
}

function deleteNameList(idTask) {
    // Tìm phần tử cha của icon click (điều kiện là cha phải là phần tử li)
    let li = document.getElementById(idTask);

    //kiểm tra xem phần hiện thị title có là nó không?
    let input = document.querySelector('.border-animation__inner');

    if(li.id == input.className.split(" ")[1]) {
        input.innerHTML = '';
    }

    //xóa ở local storage
    for(let i = 0; i < listPage.length; i++) {
        if(listPage[i].id == idTask) {
            listPage.splice(i, 1);
        }
    }
    saveToStorage("listPage", listPage);
    deleteData(idTask)
    // Xóa phần tử li cha khỏi dropdown
    li.remove();
    resetDisplay();

    event.stopPropagation();
}

//idPage là gì?
function deleteData(id) {
    for(let i = 0; i < listTodos.length; i++) {
        if(listTodos[i].idPage == id) {
            for(let j = 0; j < listTask.length; j++) {
                if(listTask[j].idTask == listTodos[i].idTask) {
                    listTask.splice(j, 1);
                    break;
                }
            }
            listTodos.splice(i, 1);
        }
    }
    saveToStorage("listTask", listTask);
    saveToStorage("listTodos", listTodos);
}

function deleteTask(idTask) {
    createNotification(3);
    let li = document.getElementById(idTask);
    li.remove();

    //xóa ở local
    let indexTask = getIDTask(idTask);
    listTask.splice(indexTask, 1);

    for(let i = 0; i < listTodos.length; i++) {
        if(listTodos[i].idTask == idTask) {
            listTodos.splice(i, 1);
        }
    }

    //lưu giá trị lại
    saveToStorage("listTask", listTask);
    saveToStorage("listTodos", listTodos);
}

function editPage(idPage) {
    let checkbox = document.querySelector('#checkbox');
    if(checkbox.checked) {
        let form = document.querySelector('.c-form');
        let checkbox = document.querySelector('#checkbox');
        let input = document.querySelector('.c-form__input');
        input.value = '';
        form.classList.remove('active');
        checkbox.checked = false;
        isEditPage = false;
        return;
    } else {
        checkbox.checked = true;
    }
    
    let objPage = listPage[getPage(idPage)];
    let input = document.querySelector(".c-form__input");
    input.value = objPage.title;

    isEditPage = true;
}

function editDataPage() {
    if(!isEditPage) {
        return;
    }
    //lấy giá trị sau khi nhập
    let input = document.querySelector('.c-form__input'); //nhận tên user input
    let title = input.value;

    //sửa giá trị trong thẻ a
    let li = document.getElementById(currentIdPage);
    let a = li.querySelector("a");
    a.textContent = title;
    
    //sửa giá trị trong phần hiện thị
    input = document.querySelector(".border-animation__inner");
    input.innerHTML = title;

    //sửa giá trị trong list
    listPage[getPage(currentIdPage)].title = title;

    isEditPage = false;
    saveToStorage("listPage", listPage);

}


/*
//make pop-up notification
1: completed
2: not completed
3: deleted
*/
function createNotification(numAction) {
    //tạo định nghĩa
    let listNtf = [
        "Please choose your main purpose before creating new task!",
        "This task is completed",
        "This task is not completed",
        "Have been deleted!"
    ]
    let listIcon = [
        '<i class="fa-solid fa-triangle-exclamation"></i>',
        '<i class="fa-sharp fa-regular fa-circle-check"></i>',
        '<i class="fa-sharp fa-solid fa-rotate-left"></i>',
        '<i class="fa-solid fa-trash"></i>'
    ]
    let idTagName = new Date().getTime();
    let tagName = 
    `
    <div id = "${idTagName}" class = "content-notificate">
        <i onclick="deleteNotification()" class="fa-sharp fa-regular fa-x turn-off"></i>
        ${listIcon[numAction]}
        <p>${listNtf[numAction]}</p>
    </div>
    `
    //tạo thông báo ra màn hình
    let div = document.getElementById("new-notification");
    div.insertAdjacentHTML("beforebegin", tagName);
    
    //kiểm tra xem đã quá số lượng chưa
    let listDiv = document.getElementsByClassName("content-notificate");
    console.log(listDiv.length)
    if(listDiv.length > 3) {
        listDiv[0].remove();
    }

    //tự động tắc sau 3s
    setTimeout(() => {
        if(document.getElementById(idTagName) != null)
            listDiv[0].remove();
    }, 4500)
    
}

