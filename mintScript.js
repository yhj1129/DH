let account;
let mintIndexForSale = 0;
let maxSaleAmount = 0;
let mintPrice = 0;
let mintStartBlockNumber = 0;
let mintLimitPerBlock = 0;
let amount = 1;
let blockNumber = 0;
let blockCnt = false;

function cntBlockNumber() {
    if(!blockCnt) {
        setInterval(function(){
            blockNumber+=1;
            document.getElementById("blockNumber").innerHTML = blockNumber;
        }, 1000);
        blockCnt = true;
    }
}

async function connect() {
    const accounts = await klaytn.enable();
    if (klaytn.networkVersion === 8217) {
        console.log("메인넷");
    } else if (klaytn.networkVersion === 1001) {
        console.log("테스트넷");
    } else {
        alert("ERROR: 클레이튼 네트워크로 연결되지 않았습니다!");
        return;
    }
    account = accounts[0];
    caver.klay.getBalance(account)
        .then(function (balance) {
            document.getElementById("myWallet").innerHTML = `     ${account.substr(0,6)} . . . ${account.substr(36,42)}`
        });
    await check_status();
}

async function check_status() {
    const myContract = new caver.klay.Contract(ABI, CONTRACTADDRESS);
    await myContract.methods.mintingInformation().call()
        .then(function (result) {
            console.log(result);
            mintIndexForSale = parseInt(result[1]);
            mintLimitPerBlock = parseInt(result[2]);
            mintStartBlockNumber = parseInt(result[4]);
            maxSaleAmount = parseInt(result[5]);
            mintPrice = parseInt(result[6]);
            // document.getElementById("mintCnt").innerHTML = `${mintIndexForSale - 1} / ${maxSaleAmount}`;
            // document.getElementById("mintLimitPerBlock").innerHTML = `트랜잭션당 최대 수량: ${mintLimitPerBlock}개`;
            // document.getElementById('amount').max = mintLimitPerBlock;
            document.getElementById("mintStartBlockNumber").innerHTML = `${mintStartBlockNumber}`;
            // document.getElementById("mintPrice").innerHTML = `민팅 가격: ${caver.utils.fromPeb(mintPrice, "KLAY")} KLAY`;
        })
        .catch(function (error) {
            console.log(error);
        });
    blockNumber = await caver.klay.getBlockNumber();
    document.getElementById("blockNumber").innerHTML = blockNumber;
    cntBlockNumber();
}

async function publicMint() {
    if (klaytn.networkVersion === 8217) {
        console.log("메인넷");
    } else if (klaytn.networkVersion === 1001) {
        console.log("테스트넷");
    } else {
        alert("ERROR: 클레이튼 네트워크로 연결되지 않았습니다!");
        return;
    }
    if (!account) {
        alert("ERROR: 지갑을 연결해주세요!");
        return;
    }

    const myContract = new caver.klay.Contract(ABI, CONTRACTADDRESS);
    // const amount = document.getElementById('amount').value;
    
    await check_status();
    if (maxSaleAmount + 1 <= mintIndexForSale) {
        alert("모든 물량이 소진되었습니다.");
        return;
    }
    const total_value = BigNumber(amount * mintPrice);
    const gasAmount = await myContract.methods.publicMint(amount).estimateGas({
        from: account,
        gas: 6000000,
        value: total_value
    })
    // try{
    //     // const response = await myContract.methods.publicMint(amount).call({
    //     //     from: account,
    //     //     gas: 6000000
    //     // })
    //     const result = await caver.klay.sendTransaction({
    //         type: "SMART_CONTRACT_EXECUTION",
    //         from: account,
    //         to: CONTRACTADDRESS,
    //         gas: gasAmount,
    //         value: total_value,
    //         data: myContract.methods.publicMint(amount).encodeABI(),
    //     }); 
    //     // const result = await myContract.methods.publicMint(amount).send({
    //     //     from: account,
    //     //     gas: gasAmount,
    //     //     value: total_value
    //     // })
    //     if (result != null) {
    //         console.log(result);
    //         alert("민팅에 성공하였습니다.");
    //     }
    try {
        // const response = await mintNFTContract?.methods.mintNFT().send({
        //   from: account,
        //   value: caver?.utils.convertToPeb(2, "KLAY"),
        //   gas: 3000000,
        // });
  
        setIsLoading(true);
  
        const response = await caver?.klay.sendTransaction({
          type: "SMART_CONTRACT_EXECUTION",
          from: account,
          to: MINT_NFT_ADDRESS,
          gas: 3000000,
          data: mintNFTContract?.methods.mintNFT().encodeABI(),
        });
  
        if (response?.status) {
          const balanceOf = await mintNFTContract?.methods
            .balanceOf(account)
            .call();
  
          if (balanceOf) {
            const myNewNFT = await mintNFTContract?.methods
              .tokenOfOwnerByIndex(account, balanceOf - 1)
              .call();
  
            if (myNewNFT) {
              const tokenURI = await mintNFTContract?.methods
                .tokenURI(myNewNFT)
                .call();
  
              if (tokenURI) {
                const imageResponse = await axios.get(tokenURI);
  
                if (imageResponse.status === 200) {
                  setNewNFT(imageResponse.data);
                }
              }
            }
          }
        }
        } catch (error) {
            if (blockNumber <= mintStartBlockNumber){
                console.log(error);
                alert("아직 민팅이 시작되지 않았습니다.");
                return;
            }else{
                console.log(error);
                alert("민팅에 실패하였습니다.");
            }
        }
    // try {
    //     // const response = await mintNFTContract?.methods.mintNFT().send({
    //     //   from: account,
    //     //   value: caver?.utils.convertToPeb(2, "KLAY"),
    //     //   gas: 3000000,
    //     // });
  
    //     setIsLoading(true);
  
    //     const response = await caver.klay.sendTransaction({
    //         type: "SMART_CONTRACT_EXECUTION",
    //         from: account,
    //         to: CONTRACTADDRESS,
    //         gas: 6000000,
    //         data: myContract.methods.publicMint(amount).encodeABI(),
    //     });   
  
    //     if (response.status) {
    //       const balanceOf = await mintNFTContract.methods
    //         .balanceOf(account)
    //         .call();
  
    //       if (balanceOf) {
    //         const myNewNFT = await mintNFTContract?.methods
    //           .tokenOfOwnerByIndex(account, balanceOf - 1)
    //           .call();
  
    //         if (myNewNFT) {
    //           const tokenURI = await mintNFTContract?.methods
    //             .tokenURI(myNewNFT)
    //             .call();
  
    //           if (tokenURI) {
    //             const imageResponse = await axios.get(tokenURI);
  
    //             if (imageResponse.status === 200) {
    //               setNewNFT(imageResponse.data);
    //             }
    //           }
    //         }
    //       }
    //     }
  
    //     setIsLoading(false);
    //   } catch (error) {
    //     console.error(error);
  
    //     setIsLoading(false);
    //   }
}
