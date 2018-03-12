import React from 'react';
import DatePicker from 'react-date-picker/dist/entry';

let pageName = '';
let token = '';
let pageIDno_ = 0;

let common_ = [];
let pageFans = 0;
let recordData = '';
let loaderDiv_ = '';
let dateFrom_ = '';
let dateTo_ = '';
let totalLikes = null, totalShare = null, totalComments = null;
let errorMsgDateFormat = '';
let searchPageNameHTML = '';
let errorDateRangHTML = '';
let noRecordHTML = '';
let fbLoginProfilePicture = '';
let fbLoginProfileName = '';

class Facebook extends React.Component{
  constructor(props) {
    super(props);    
    this.handleClick = this.handleClick.bind(this);    
    this.handleClickLogout =this.handleClickLogout.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.dataSearch = this.dataSearch.bind(this);
    this.dataReset = this.dataReset.bind(this);
    this.dateWiseFilter = this.dateWiseFilter.bind(this);
    this.formatDate = this.formatDate.bind(this);
    this.state = {
      inputVal : '',
      listItems : '',
      txtLimit : 50,
      getData : false,
      getRecordData : false,
      dateFrom: new Date(),
      dateTo: new Date(),
      loaderDiv : false,
      erromsgDate : false,
      searchPageName : false,
      errorDateRang : false,
      noRecord : false
    }
  }
  componentDidMount() {
    window.fbAsyncInit = function () {
      this.FB.init({
        appId: '482870401901396',
        autoLogAppEvents: true,
        xfbml: true,
        version: 'v2.11'
      }); 

      // Broadcast an event when FB object is ready
      var fbInitEvent = new Event('FBObjectReady');
      document.dispatchEvent(fbInitEvent);
    };

    (function (d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) { return; }
      js = d.createElement(s); js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
    document.addEventListener('FBObjectReady', this.initializeFacebookLogin);

  }

  initializeFacebookLogin = () => {    
    this.FB = window.FB;
    //this.checkLoginStatus();
  }

  handleClick = () => {
    this.FB = window.FB;
    if (!this.FB) return;
    this.FB.login(function(response) {
      if (response.authResponse) {
        token = response.authResponse.accessToken;
        console.log(response);
        this.FB.api('/me?fields=name, picture.type(large)', function(response) {          
          console.log('Good to see you, ' + response.name + '.');
          console.log(response);
          fbLoginProfilePicture = response.picture.data.url;
          fbLoginProfileName = response.name ;
          console.log(fbLoginProfilePicture);
          this.setState({ getData : true })
        }.bind(this));
       } else {
        console.log('User cancelled login or did not fully authorize.');
       }
    }.bind(this), {scope: 'email,user_likes,read_insights'});
    this.setState({text:true});
  }

  handleChange = (event) => {
    this.setState({inputVal: event.target.value});
    pageName = event.target.value;
    //console.log('.....-->  '+pageName)
  }

  
  
  dataSearch = () => {
     totalLikes = 0;
     totalShare = 0;
     totalComments = 0;
     
     console.log('page pageName :'+pageName);
     this.FB.api('/'+pageName+'?access_token='+token+'&fields=name, fan_count', function(response) { 
        if (response.hasOwnProperty("error")) {
          this.setState({
             searchPageName : true
          });
          console.log("Error: " + response.error.message);
        } else {       
          pageIDno_ = response.id;
          pageFans = response.fan_count;
          this.setState({
             loaderDiv : true,
             searchPageName : false
          });

          this.FB.api('/v2.12/'+pageIDno_+'/posts/?fields=name,message,link,permalink_url,created_time,to,from,images, full_picture, picture.type(large),type,id,comments.limit(0).summary(true),shares,likes.limit(0).summary(true),photo,reactions.type(LIKE).limit(0).summary(1).as(like), reactions.type(WOW).limit(0).summary(1).as(wow), reactions.type(SAD).limit(0).summary(1).as(sad), reactions.type(LOVE).limit(0).summary(1).as(love),reactions.type(ANGRY).limit(0).summary(1).as(angry),reactions.type(HAHA).limit(0).summary(1).as(haha), reactions.limit(0).summary(true)&limit=100&access_token='+token, function(response) {        
            console.log('---------------------------------------------------------------------------');
            console.log(response);
            common_ = response.data;
              this.setState({
                  getRecordData : true,
                  loaderDiv : false,                  
                  listItems : common_.map((common_, i) => 
                    <li key={i}>       
                      <div className="hidden">
                      { totalLikes = totalLikes + common_.likes.summary.total_count }
                      { totalShare = totalShare + (common_.hasOwnProperty('shares') ?  common_.shares.count :  0 )}
                      { totalComments = totalComments + common_.comments.summary.total_count }                  
                      </div>
                      
                      <div className='img'> <div className="imgDiv"> <a href={common_.permalink_url} target='_blank'><img src={common_.hasOwnProperty('full_picture') ?  common_.full_picture :  './images/fb-dummy-image.png'} /></a></div></div>
                      <div className="leftCont">
                        {common_.hasOwnProperty('name') ?  <h3> {common_.name} </h3> :  '' }
                        <ul className='socialUL'>
                          <li className='likes'>{common_.likes.summary.total_count}</li>
                          <li className='love'>{common_.love.summary.total_count}</li>
                          <li className='haha'>{common_.haha.summary.total_count}</li>
                          <li className='wow'>{common_.wow.summary.total_count}</li>
                          <li className='sad'>{common_.sad.summary.total_count}</li>
                          <li className='angry'>{common_.angry.summary.total_count}</li>
                          <li className="reactionCount"><span>Total Reactions</span>{common_.reactions.summary.total_count}</li>
                          </ul>
                          <ul className='socialUL'>
                          <li className="reactionCount"><span>Total Share</span> { common_.hasOwnProperty('shares') ?  common_.shares.count :  0 }  </li>                  
                          <li className="reactionCount"><span>Total Comments</span> {common_.comments.summary.total_count}  </li>
                          <li className="reactionCount"><span>Engagement Rate</span> { (((common_.likes.summary.total_count + (common_.hasOwnProperty('shares') ?  common_.shares.count :  0) + common_.comments.summary.total_count)/pageFans)*100).toFixed(4) }%  </li>                  
                          <li className="reactionCount"><span>Post Date</span> {common_.created_time.slice('0','10')}  </li>                  
                        </ul>
                        <p className="msgTxt">{common_.message}  </p>
                        <p className="msgTxt readMore"><a href={common_.permalink_url} target="_blank">Read more</a>  </p>
                      </div>
                    </li>
                  )
              });
          }.bind(this));
        }
    }.bind(this));
  }

  onChangeFrom = dateFrom => this.setState({ dateFrom });
  onChangeTo = dateTo => this.setState({  dateTo });

  formatDate = (value) => {   
    return value.getMonth()+1 + "/" + value.getDate() + "/" + value.getYear(); 
  }

  dateWiseFilter = () => {
    if(!(this.state.dateFrom === null ||  this.state.dateTo === null)){
      this.setState({
        erromsgDate : false
      });
      dateFrom_ = parseInt(this.state.dateFrom.getFullYear()) + '/' + parseInt(this.state.dateFrom.getMonth()+1) + '/' + parseInt(this.state.dateFrom.getDate());
      dateTo_ = parseInt(this.state.dateTo.getFullYear()) + '/' +  parseInt(this.state.dateTo.getMonth()+1) + '/' + parseInt(this.state.dateTo.getDate());
      console.log('FromDate-->  '+  dateFrom_) ;
      console.log('ToDate-->  '+ dateTo_) ;
    
      this.FB.api('/v2.12/'+pageIDno_+'/posts/?since='+dateFrom_+'&until='+dateTo_+'&fields=message,link,permalink_url,created_time,to,from,images, full_picture, picture.type(large),type,name,id,comments.limit(0).summary(true),shares,likes.limit(0).summary(true),photo,reactions.type(LIKE).limit(0).summary(1).as(like), reactions.type(WOW).limit(0).summary(1).as(wow), reactions.type(SAD).limit(0).summary(1).as(sad), reactions.type(LOVE).limit(0).summary(1).as(love),reactions.type(ANGRY).limit(0).summary(1).as(angry),reactions.type(HAHA).limit(0).summary(1).as(haha), reactions.limit(0).summary(true)&limit=100&access_token='+token, function(response) {        
          if (response.hasOwnProperty("error")) {
            console.log("Error Date selection : " + response.error.message);              
            this.setState({
              errorDateRang : true,
              noRecord : false
            });           
          } else {             
            console.log('---------------------------------------------------------------------------');
            console.log(response);
            common_ = response.data;
            if(common_.length === 0){
              totalLikes = 0;
              totalShare = 0;
              totalComments = 0;
              this.setState({
                listItems : '',
                noRecord : true
              });
            }else{            
              this.setState({
                  getRecordData : true,
                  loaderDiv: false,
                  errorDateRang : false,  
                  erromsgDate : false,   
                  noRecord : false,             
                  listItems : common_.map((common_, i) => 
                    <li key={i}>
                      <div className="hidden">
                        { totalLikes = totalLikes + common_.likes.summary.total_count }
                        { totalShare = totalShare + ( common_.hasOwnProperty('shares') ?  common_.shares.count :  0 ) }
                        { totalComments = totalComments + common_.comments.summary.total_count }                  
                    </div>

                    <div className='img'><a href={common_.permalink_url} target='_blank'><img src={common_.hasOwnProperty('full_picture') ?  common_.full_picture :  './images/fb-dummy-image.png'} alt='' /></a></div>
                      <div className="leftCont">
                          {common_.hasOwnProperty('name') ?  <h3> {common_.name} </h3> :  ''}
                          <ul className='socialUL'>
                            <li className='likes'>{common_.likes.summary.total_count}</li>
                            <li className='love'>{common_.love.summary.total_count}</li>
                            <li className='haha'>{common_.haha.summary.total_count}</li>
                            <li className='wow'>{common_.wow.summary.total_count}</li>
                            <li className='sad'>{common_.sad.summary.total_count}</li>
                            <li className='angry'>{common_.angry.summary.total_count}</li>
                            <li className="reactionCount"><span>Total Reactions</span>{common_.reactions.summary.total_count}</li>
                            <li className="reactionCount"><span>Total Share</span> { common_.hasOwnProperty('shares') ?  common_.shares.count :  0 }  </li>                  
                            <li className="reactionCount"><span>Total Comments</span> {common_.comments.summary.total_count}  </li>
                            <li className="reactionCount"><span>Engagement Rate</span> { (((common_.likes.summary.total_count + (common_.hasOwnProperty('shares') ?  common_.shares.count :  0) + common_.comments.summary.total_count)/pageFans)*100).toFixed(4) }%  </li>                  
                            <li className="reactionCount"><span>Post Date</span> {common_.created_time.slice('0','10')}  </li>                  
                          </ul>
                        <p className="msgTxt">{common_.message}  </p>
                        <p className="msgTxt readMore"><a href={common_.permalink_url} target="_blank">Read more</a>  </p>
                        </div>
                    </li>
                  )
              });
            }
          }
      }.bind(this));
    }else{
      totalLikes = 0;
      totalShare = 0;
      totalComments = 0;


      this.setState({
        erromsgDate : true,
        errorDateRang : false,
        listItems : ''
      });
    }

       
    

  }

  dataReset = () => {
    this.setState({
      listItems : '',
      getRecordData : false,
      searchPageName : false,
      inputVal : ''
    });
    totalLikes = 0;
    totalShare = 0;
    totalComments = 0;    
    pageFans = 0;
    pageName = 'Enter Facebook Page Name'
  }



  handleClickLogout = () => {
    this.FB = window.FB;
    if (!this.FB) return;
    this.FB.logout(function(response) {
      console.log('user log out');
      this.setState({getData : false, getRecordData : false, listItems : ''})
      totalLikes = 0;
      totalShare = 0;
      totalComments = 0;
      pageFans = 0;
    }.bind(this));
  }

    render(){
    let dataShow = (
        <div className="buttons">
          <a href="javascript:;" className="link fbLogin" onClick={this.handleClick} >Login in with Facebook</a>
        </div>
    );

    
    if(this.state.loaderDiv) {
      loaderDiv_ = (
         <div className="loader"><img src="./images/loader.gif" /></div>
      );
    }else{
      loaderDiv_ = '';
    }

    if(this.state.erromsgDate){
      errorMsgDateFormat = (<div className="errorMsg"><p> Please choose the correct date. </p></div>)
    }else{
      errorMsgDateFormat = '';
    }

    if(this.state.searchPageName){
      searchPageNameHTML = (<div className="errorMsg"><p> please enter valid facebook page name </p></div>)
    }else{
      searchPageNameHTML = '';
    }

    if(this.state.errorDateRang){
      errorDateRangHTML = (<div className="errorMsg"><p> Time window start should be less or equal than end </p></div>)
    }else{
      errorDateRangHTML = '';
    }

    if(this.state.noRecord){
      noRecordHTML = (<div className="noRecordMsg"><p> No record found </p></div>)
    }else{
      noRecordHTML = '';
    }

    

    

    


    if(this.state.getRecordData) {
      recordData = (
          <div className="record">
            <ul className="dataUL">
              <li>
                  <h3>Page Fans <span>{pageFans}</span></h3>                  
              </li>
              
              <li>
                  <h3>All Posts Likes <span>{ totalLikes }</span></h3>                  
              </li>
              <li>
                  <h3>All Posts Shares <span>{ totalShare }</span></h3>                  
              </li>
              <li>
                  <h3>All Posts Comments <span>{ totalComments }</span></h3>                  
              </li>
            </ul>

            <div className="filter">
              <ul className="filterUL">
                <li><DatePicker dateFormat="DD/MM/YY"  selected={this.state.dateFrom} onChange={this.onChangeFrom} value={this.state.dateFrom} /></li>
                <li><DatePicker dateFormat="DD/MM/YY"  selected={this.state.dateTo} onChange={this.onChangeTo} value={this.state.dateTo} /></li>
                <li ><a href="javascript:;" className="link" onClick={this.dateWiseFilter}>GO</a></li>
              </ul>
              { errorMsgDateFormat }
              { errorDateRangHTML }
            </div>
            {noRecordHTML}
            <ul className="recordUL">{ this.state.listItems }</ul>
          </div>
      );
    }else{
      recordData = '';
    }

    if(this.state.getData) {
      dataShow = <div className="fbMidWrapper">

        
        <div className="inputFields">
          <input type="text" placeholder={pageName} value={this.state.inputVal} onChange={this.handleChange} />
        </div>
        <div className="buttons">
          <div className="link" onClick={this.dataSearch}> Search </div>
          <div className="link" onClick={this.dataReset}> Reset </div>
        </div>
        
        {searchPageNameHTML}
        {loaderDiv_}
        {recordData}


        <div className="profileImg"><p><img src={ fbLoginProfilePicture } /> <span>{fbLoginProfileName}</span></p>

          <a href="javascript:;" className="logoutBtn" onClick={this.handleClickLogout} >Logout</a>

        </div>
        
      </div>
    }
   return (
      <div className="fbWrapper">
        {dataShow}        
      </div>
    )
  }
}
export default Facebook;