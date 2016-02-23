// // Booklist data array for filling in info box
// var bookListData = [];

// // DOM Ready =============================================================
// $(document).ready(function() {

//     // Populate the book table on initial page load
//     populateTable();

//     //bookname link click
//     $('#bookList table tbody').on('click', 'td a.linkshowbook', showBookInfo);

//     //add book button click
//     $('#btnAddBook').on('click', addBook);

//     //delete book link click
//     $('#bookList table tbody').on('click', 'td a.linkdeletebook', deleteBook);

//     //update book link click
//     $('#bookList table tbody').on('click', 'td a.linkupdatebook', updateBook);

// });

// // Functions =============================================================

// // Fill table with data
// function populateTable() {

//     // Empty content string
//     var tableContent = '';

//     // jQuery AJAX call for JSON
//     $.getJSON( '/books/booklist', function( data ) {

//         // Stick our book data array into a booklist variable in the global object
//         bookListData = data;

//         // For each item in our JSON, add a table row and cells to the content string
//         $.each(data, function(){
//             tableContent += '<tr>';
//             tableContent += '<td><a href="#" class="linkshowbook" rel="' + this.bookname + '">' + this.bookname + '</a></td>';
//             tableContent += '<td>' + this.email + '</td>';
//             tableContent += '<td><a href="#" class="linkdeletebook" rel="' + this._id + '">delete</a></td>';
//             tableContent += '<td><a href="#" class="linkupdatebook" rel="' + this._id + '">update</a></td>';
//             tableContent += '</tr>';
//         });

//         // Inject the whole content string into our existing HTML table
//         $('#bookList table tbody').html(tableContent);
//     });
// };

// //display book info
// function showBookInfo(event){

//     //prevent link from firing.
//     event.preventDefault();

//     //retrieve bookname from link rel attribute
//     var thisBookName = $(this).attr('rel');
//     // Get Index of object based on id value
//     var arrayPosition = bookListData.map(function(arrayItem) { return arrayItem.bookname; }).indexOf(thisBookName);

//     // Get our Book Object
//     var thisBookObject = bookListData[arrayPosition];

//     //Populate Info Box
//     $('#bookInfoName').text(thisBookObject.bookname);
//     //$('#userInfoAge').text(thisUserObject.age);
//     //$('#userInfoGender').text(thisUserObject.gender);
//     $('#bookUserLocation').text(thisBookObject.location);

// }

// //Add book
// function addBook(event){
//     event.preventDefault();

//     //basic validation -- increase errorCount variable if any fields are blank
//     var errorCount = 0;
//     $('#addBook input').each(function(index, val){
//        if($(this).val() === ''){
//            errorCount++;
//        }
//     });

//     //check and make sure errorCount is still at 0
//     if(errorCount === 0){

//         //if it is, compile all book info into one object
//         var newBook = {
//             'bookname': $('#addBook fieldset input#inputBookName').val(),
//             'email': $('#addBook fieldset input#inputBookOwnerEmail').val(),
//             ///'fullname': $('#addUser fieldset input#inputUserFullname').val(),
//             //'age': $('#addUser fieldset input#inputUserAge').val(),
//             'location': $('#addBook fieldset input#inputBookOwnerLocation').val(),
//             'gender': $('#addBook fieldset input#inputBookOwnerGender').val()
//         }

//         //use AJAX to post the object to our addbook service
//         $.ajax({
//             type: 'POST',
//             data: newBook,
//             url: '/books/addbook',
//             dataType: 'JSON'
//         }).done(function(response){

//             //check for successful (blank) response
//             if (response.msg === ''){

//                 //clear the form inputs
//                 $('#addBook fieldset input').val('');

//                 //update the table
//                 populateTable();


//             }
//             else{
//                 // If something goes wrong, alert the error message that our service returned
//                 alert('Error: ' + response.msg);
//             }
//         });
//     }
//     else{
//     // If errorCount is more than 0, error out
//         alert('Please fill in all fields');
//         return false;
//     }
// }

// //DELETE book

// function deleteBook(){

//     event.preventDefault();

//     //pop up a confirmation dialog
//     var confirmation = confirm("Are you sure you want to delete this book's record ?");

//     //check and make sure the user confirmed
//     if (confirmation === true){

//         //if true, DELETE
//         $.ajax({
//             type: 'DELETE',
//             url: '/books/deletebook/' + $(this).attr('rel')
//         }).done(function(response){

//             //check for a successful (blank) response
//             if (response.msg === ''){

//             }
//             else {
//                 alert('Error: ' +response.msg );
//             }

//             //update the table
//             populateTable() ;

//         });
//     }
//     else{

//         //if user does not confirm delete
//         return false;
//     }
// }

// //UPDATE book
// function updateBook(){}