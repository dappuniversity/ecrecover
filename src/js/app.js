App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  loading: false,
  contractInstance: null,
  msg: '0x0',
  signature: '0x0',
  account: '0x0',

  init: () => {
    return App.initWeb3();
  },

  //neues Connect mit Metamask
  //const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

  // Addresses Metamask breaking changes
  // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
  initWeb3: async () => {
   // if (typeof web3 !== 'undefined') {
    if (typeof window.ethereum !== 'undefined') {
      //App.web3Provider = web3.currentProvider;
      App.web3Provider = ethereum;
      //web3 = new Web3(web3.currentProvider);
      web3 = new Web3(Web3.givenProvider);
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      App.account = accounts[0];
      console.log('account::', App.account)
    } else {
      window.alert("Please connect to Metamask.")
    }
    // Modern dapp browsers...
  
    return App.initContracts();
  },

  initContracts: async () => {

    contract=await $.getJSON("Verification.json");
      console.log('contract', contract)
      App.contracts.Verification = new web3.eth.Contract(contract.abi, '0xDCEc46650aeE1D0F19D2f75Ae2D6f6d71df8651E')
      App.contracts.Verification.setProvider(App.web3Provider);
      return App.render();
    
  },

  render: () => {
    if (App.loading) {
      return;
    }

    App.loading = true;

    let loader = $("#loader");
    let content = $("#content");

    loader.show();
    content.hide();

    // Load blockchain data
    console.log(web3.eth.accounts)
    //App.account = web3.eth.accounts[0];
    console.log("Your Account:", App.account);

   // App.contracts.Verification.deployed().then((contract) => {
      App.contractInstance = App.contracts.Verification;
      console.log("ContractInstance", App.contractInstance)
      console.log("Contract Address:", App.contractInstance._address);
     // return true
    //}).then((val) => {
      $('#account').html(App.account);
      loader.hide();
      content.show();
   // });
  },

  signMessage: () => {
    $("#content").hide();
    $("#loader").show();

    const message = web3.utils.sha3( $('#message').val() )
    console.log('message', message)
    console.log('App-account:', web3.utils.toChecksumAddress(App.account));
    web3.eth.sign(message, App.account, function (err, result) {
      console.log(err, result)
      $('form').trigger('reset')
      App.msg = message
      $('#msg').html('message:' + ' ' + message)
      App.signature = result
      $('#signature').html('signature:' + ' ' + result)
      $('#verify').show()
      $("#content").show();
      $("#loader").hide();
      window.alert('Message signed!')
    })
  },

  verify: async () => {
    $("#content").hide();
    $("#loader").show();

   const result = await App.contractInstance.methods.recover(App.msg, App.signature).call({from: App.account})
   console.log('result::', result)
      console.log('Recover', web3.utils.toChecksumAddress(result))
      $('#address').html('This account signed the message:' + ' ' + result)

    $("#content").show();
    $("#loader").hide();
  }
};

$(() => {
  $(window).load(() => {
    App.init();
  });
});
