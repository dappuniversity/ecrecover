App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  loading: false,
  contractInstance: null,
  msg: '0x0',
  signature: '0x0',

  init: () => {
    return App.initWeb3();
  },

  // Addresses Metamask breaking changes
  // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
  initWeb3: async () => {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      window.alert("Please connect to Metamask.")
    }
    // Modern dapp browsers...
    if (window.ethereum) {
      window.web3 = new Web3(ethereum);
      try {
        // Request account access if needed
        await ethereum.enable();
        // Acccounts now exposed
        web3.eth.sendTransaction({/* ... */});
      } catch (error) {
        // User denied account access...
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = web3.currentProvider;
      window.web3 = new Web3(web3.currentProvider);
      // Acccounts always exposed
      web3.eth.sendTransaction({/* ... */});
    }
    // Non-dapp browsers...
    else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
    return App.initContracts();
  },

  initContracts: () => {
    $.getJSON("Verification.json", (contract) => {
      console.log('contract', contract)
      App.contracts.Verification = TruffleContract(contract);
      App.contracts.Verification.setProvider(App.web3Provider);
      return App.render();
    });
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
    App.account = web3.eth.accounts[0];
    console.log("Your Account:", App.account);

    App.contracts.Verification.deployed().then((contract) => {
      App.contractInstance = contract;
      console.log("ContractInstance", App.contractInstance)
      console.log("Contract Address:", App.contractInstance.address);
      return true
    }).then((val) => {
      $('#account').html(App.account);
      loader.hide();
      content.show();
    });
  },

  signMessage: () => {
    $("#content").hide();
    $("#loader").show();

    const message = web3.sha3( $('#message').val() )
    console.log('message', message)

    web3.eth.sign(App.account, message, function (err, result) {
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

  verify: () => {
    $("#content").hide();
    $("#loader").show();

    App.contractInstance.recover(App.msg, App.signature).then(function(result) {
      console.log('Recover', result)
      $('#address').html('This account signed the message:' + ' ' + result)
    }).catch((err) => {
      console.error(err);
      window.alert("There was an error recovering signature.")
    });

    $("#content").show();
    $("#loader").hide();
  }
};

$(() => {
  $(window).load(() => {
    App.init();
  });
});
