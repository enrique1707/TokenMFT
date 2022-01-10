import { FormControl, FormGroup } from '@angular/forms';
import { Component, AfterViewInit, ElementRef, ViewChild,ViewChildren,QueryList} from '@angular/core';
import { Web3Service } from './services/web3.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  @ViewChild('scrollframe',{static:false}) private scrollFrame!: ElementRef;
  @ViewChildren('item') itemElements!: QueryList<any>;

  private scrollContainer: any;

  title = 'Ejemplo Ethereum';
  msgEstado = 'No Conectado.';
  estado = false;
  count = 0;
  resultado = '';
  points = 0;
  totalRewardPoints = 0;
  Suma = 0;
  resta= 0;
  Decimales = null;
  TotalSuply = null;

  blockHash = '';
  blockNumber = '';
  from = '';
  transactionHash = '';
  totalBalance = '';
  amount = '';
  rewardPoints = '';
  exchangedRewardPoints = '';
  balanceOf = '';
  NombreToken = '';
  Alias = '';

  elementos: any = [];  
  elementosClient: any = [];  

  cabeceras = ['Transaction Hash', 'Block Number','Amount','Sended Reward Points','Total Reward Points','To'];
  cabecerasClient = ['Transaction Hash', 'Block Number','Total Reward Points','Exchanged Reward Points','From'];

  constructor(public web3s: Web3Service){}

  InfoMFT = new FormGroup({
   
  });

 
  consultaSaldoForm = new FormGroup({
    addressConsultaSaldo: new FormControl('')
  });
 
  SumarNumeros = new FormGroup({
    NumeroA: new FormControl(''),
    NumeroB: new FormControl('')
  })
  
  TrasnsferenciaCuenta = new FormGroup({
    cuentaA: new FormControl(''),
    cuentaB: new FormControl(''),
    cantidadT: new FormControl('')
  })
  
  DivisionNumeros = new FormGroup({
    NumeroA: new FormControl(''),
    NumeroB: new FormControl('')
   
  })
  

  sendPointsForm = new FormGroup({
    accountAddress: new FormControl(''),
    sellAmount: new FormControl('')
  });

  exchangedPointsForm = new FormGroup({
    exchangePoints: new FormControl(''),
    CuentaRetiro: new FormControl('')
  });


  ngAfterViewInit(): void {
    this.conectar();
    this.scrollContainer = this.scrollFrame.nativeElement;      
    //this.elementos.changes.subscribe(() => this.onElementosChanged());   
  }

  private onElementosChanged(): void {
    this.scrollToBottom();
  }

  conectar():void {
    this.web3s.connectAccount().then((r)=>{ 
      this.msgEstado = "Conectado.";
      this.estado = true;
      this.subscribeToEvents();
    });
  }

 
  

  getTotalRewardPoints(): void {
    this.web3s.contrato.methods.getTotalRewardPoints()
    .call()
    .then((response: any) => {
      this.totalRewardPoints = response;
      console.log(`totalRewardPoints => ${response}`);
    });
  }

  getRewardPoints(): void {
    this.web3s.contrato.methods.getRewardPoints()
    .call()
    .then((response: any) => {
      this.getRewardPoints = response;
      console.log(`getRewardPoints => ${response}`);
    });
  }

  getExchangedRewardPoints(): void {
    this.web3s.contrato.methods.getExchangedRewardPoints()
    .call()
    .then((response: any) => {
      this.getRewardPoints = response;
      console.log(`getExchangedRewardPoints => ${response}`);
    });
  }


  getBalance(): void {
    this.web3s.contrato.methods.balanceOf(this.web3s.accounts[0])
    .call()
    .then((response: any) => {
      this.totalBalance = response;
    });
  }

  async getBalanceByAccount(accountAddress: any): Promise<any> {
    return await this.web3s.contrato.methods.balanceOf(accountAddress).call();
  }

  async SumNum(A: any, B: any ): Promise<any> {
    return await this.web3s.contrato.methods.safeAdd(A, B).call();
  }

  async DivNum(A: any, B: any ): Promise<any> {
    return await this.web3s.contrato.methods.safeSub(A, B).call();
  }

  
  

  async checarBalance(): Promise<void> {
    const addressDapp =  this.consultaSaldoForm.get('addressConsultaSaldo')?.value;
    console.log(addressDapp);
    const accountBalance = await this.getBalanceByAccount(addressDapp);
    console.log(`accountBalance => ${accountBalance}`);
    this.balanceOf = accountBalance;
  }
 
  
  async info(): Promise<any> {
    const OA = '0x0690343CC2318849d2d800431DdC0708f891562b';
    const a = await this.getBalanceByAccount(OA);
    this.TotalSuply = a;
    const b = await this.web3s.contrato.methods.name().call();
    this.NombreToken = b;
    const c = await this.web3s.contrato.methods.decimals().call();
    this.Decimales = c; 
    const d = await this.web3s.contrato.methods.symbol().call();
    this.Alias = d;
  }

 

  async AdicionarTokens(): Promise<void>{
    const NumDapp =  this.SumarNumeros.get('NumeroA')?.value;
    console.log(NumDapp);
    const NumDapp2 =  this.SumarNumeros.get('NumeroB')?.value;
    console.log(NumDapp2);
    const SumaNumeros = await this.SumNum(NumDapp, NumDapp2);
    console.log(`SumaNumeros => ${SumaNumeros}`);
    this.Suma = SumaNumeros;
  }


    async Transferir(): Promise<void> {
    
    const CuentaA = this.TrasnsferenciaCuenta.get('cuentaA')?.value;
    const CuentaB = this.TrasnsferenciaCuenta.get('cuentaB')?.value;
    const CantidadT =  this.TrasnsferenciaCuenta.get('cantidadT')?.value;
    
    
    console.log(CuentaA);
    console.log(CuentaB);
    console.log(CantidadT);

    
   
    this.web3s.contrato.methods.transferFrom(CuentaA, CuentaB, CantidadT).send({from: this.web3s.accounts[0]})

    .then((response:any) => {
      this.resultado = "Transacción realizada!";
      this.blockHash = response.blockHash;
      this.blockNumber = response.blockNumber;
      this.from = response.from;
      this.transactionHash = response.transactionHash;
      this.web3s.contrato.methods.approve(CuentaB, CantidadT).send({from: this.web3s.accounts[0]})
      this.getBalance();
   })
   .catch((error: any) => {
      console.log(error);
      this.resultado = "Error en la transacción!";
   });
  }
    

  

  /*async RestarNumeros(): Promise<void>{
    const NumDapp =  this.DivisionNumeros.get('NumeroA')?.value;
    const NumDapp2 =  this.DivisionNumeros.get('NumeroB')?.value;
    const restaNumeros = await this.DivNum(NumDapp, NumDapp2);

    console.log(`restaNumeros => ${restaNumeros}`);
    this.resta= restaNumeros;
  }*/




  async transferirMFT(): Promise<void> {
    const accountAddress = this.sendPointsForm.get('accountAddress')?.value;
    const sellAmount = this.sendPointsForm.get('sellAmount')?.value;
    
    this.web3s.contrato.methods.transfer(accountAddress, sellAmount).send({from: this.web3s.accounts[0]})
    .then((response:any) => {
      this.resultado = "Transacción realizada!";
      this.blockHash = response.blockHash;
      this.blockNumber = response.blockNumber;
      this.from = response.from;
      this.transactionHash = response.transactionHash;
      this.web3s.contrato.methods.approve(accountAddress, sellAmount).send({from: this.web3s.accounts[0]})
   })
   .catch((error: any) => {
      console.log(error);
      this.resultado = "Error en la transacción!";
   });

  }


  async cobrarMFT(): Promise<void> {
    this.borrar();
    const sellAmount1 = this.exchangedPointsForm.get('exchangePoints')?.value;
    const ownerAddress1 = '0x0690343CC2318849d2d800431DdC0708f891562b';

    this.web3s.contrato.methods.transfer(ownerAddress1, sellAmount1).send({from: this.web3s.accounts[0]})
    .then((response:any) => {
      this.resultado = "Transacción realizada!";
      this.blockHash = response.blockHash;
      this.blockNumber = response.blockNumber;
      this.from = response.from;
      this.transactionHash = response.transactionHash;
   })
   .catch((error: any) => {
      console.log(error);
      this.resultado = "Error en la transacción!";
   });
  }


  

  borrar(): void {
    this.resultado = "";
    this.blockHash = "";
    this.blockNumber = "";
    this.from = "";
    this.transactionHash = "";
  }
  
  subscribeToEvents() {
    
    const self = this;
    this.web3s.contrato.events.Transfer({
                                              fromBlock: 0
                                            },
                                            (error: any, event: any) => {
                                              if (!error){
                                                // setInterval(() => {

                                                  const abiDecoder = require('abi-decoder'); // NodeJS
                                                  abiDecoder.addABI(this.web3s.abi);
                                                  
                                                  this.web3s.web3js.eth.getTransaction(event.transactionHash).then(async (data: any) => {

                                                    const decodedData = abiDecoder.decodeMethod(data.input);

                                                    if(decodedData != undefined) {

                                                      
                                                      if(decodedData.name == 'transfer') {
                                                        

                                                        this.elementos.push(
                                                          { blockHash: event.blockHash,
                                                            transactionHash: event.transactionHash,
                                                            blockNumber:event.blockNumber,                                            
                                                            accountAddress: event.returnValues.to
                                                          }
                                                        );
  
                                                        this.elementos = this.elementos.sort((a: any, b: any) => parseInt(a.blockNumber) - parseInt(b.blockNumber));

                                                      
                                                      }else if(decodedData.name == 'transferFrom') {
                                                        

                                                        this.elementosClient.push(
                                                          { blockHash: event.blockHash,
                                                            transactionHash: event.transactionHash,
                                                            blockNumber:event.blockNumber,                                            
                                                            accountAddress: event.returnValues.from
                                                          }
                                                        );
  
                                                        this.elementosClient = this.elementosClient.sort((a: any, b: any) => parseInt(a.blockNumber) - parseInt(b.blockNumber));

                                                      }else {

                                                      }
                                                      
                                                    }

                                                  });
                                                  
                                                // }, 500);                                                                                                
                                              }                                              
                                            });
  }

  scrollToBottom() {
    this.scrollContainer.scroll({
      top: this.scrollContainer.scrollHeight,
      left: 0,
      behavior: 'smooth'
    });
  }
}
