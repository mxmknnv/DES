// r=1 читаем ключ
// r=0 читаем входную информацию
function readfile(f, r)
{	
	var reader = new FileReader();
	reader.readAsText(f);
	reader.onload = function ()
	{
		var text = reader.result;
		if(r)
		{
			if(text.length>16)
			{
				window.alert("Ключ должн быть длинной 64 бита (16-ти значное шестнадцатеричное число)");
				return;
			}
			document.form.key.value = "";
			document.form.key.value = text;
		}
		else
		{
		document.form.input.value = "";
		document.form.input.value = text;
		}
	};
	reader.onerror = function(e)
	{
		console.log("Error", e);
	};
}

// Специальное значение в [0] для обозначения ошибки
var ERROR_VAL = -9876;

//Массивы для перестановок.
//[0]==-1 все ok
//Взято с http://ru.wikipedia.org/wiki/DES 

//Начальная перестановка блока данных (табл. 1)
var IP_perm = new Array( -1,
	58, 50, 42, 34, 26, 18, 10, 2,
	60, 52, 44, 36, 28, 20, 12, 4,
	62, 54, 46, 38, 30, 22, 14, 6,
	64, 56, 48, 40, 32, 24, 16, 8,
	57, 49, 41, 33, 25, 17, 9, 1,
	59, 51, 43, 35, 27, 19, 11, 3,
	61, 53, 45, 37, 29, 21, 13, 5,
	63, 55, 47, 39, 31, 23, 15, 7 );

//Конечная перестановка блока данных (табл. 8)
var FP_perm = new Array( -1,
	40, 8, 48, 16, 56, 24, 64, 32,
	39, 7, 47, 15, 55, 23, 63, 31,
	38, 6, 46, 14, 54, 22, 62, 30,
	37, 5, 45, 13, 53, 21, 61, 29,
	36, 4, 44, 12, 52, 20, 60, 28,
	35, 3, 43, 11, 51, 19, 59, 27,
	34, 2, 42, 10, 50, 18, 58, 26,
	33, 1, 41, 9, 49, 17, 57, 25 );

//Функция расширения E (табл. 2)
var E_perm = new Array( -1,
	32, 1, 2, 3, 4, 5,
	4, 5, 6, 7, 8, 9,
	8, 9, 10, 11, 12, 13,
	12, 13, 14, 15, 16, 17,
	16, 17, 18, 19, 20, 21,
	20, 21, 22, 23, 24, 25,
	24, 25, 26, 27, 28, 29,
	28, 29, 30, 31, 32, 1 );

//Перестановка P (табл. 4)
var P_perm = new Array( -1,
	16, 7, 20, 21, 29, 12, 28, 17,
	1, 15, 23, 26, 5, 18, 31, 10,
	2, 8, 24, 14, 32, 27, 3, 9,
	19, 13, 30, 6, 22, 11, 4, 25 );

//Преобразования S (табл. 3)
//Тут используем [0]
var S1 = new Array(
	14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7,
	0, 15, 7, 4, 14, 2, 13, 1, 10, 6, 12, 11, 9, 5, 3, 8,
	4, 1, 14, 8, 13, 6, 2, 11, 15, 12, 9, 7, 3, 10, 5, 0,
	15, 12, 8, 2, 4, 9, 1, 7, 5, 11, 3, 14, 10, 0, 6, 13 );
var S2 = new Array(
	15, 1, 8, 14, 6, 11, 3, 4, 9, 7, 2, 13, 12, 0, 5, 10,
	3, 13, 4, 7, 15, 2, 8, 14, 12, 0, 1, 10, 6, 9, 11, 5,
	0, 14, 7, 11, 10, 4, 13, 1, 5, 8, 12, 6, 9, 3, 2, 15,
	13, 8, 10, 1, 3, 15, 4, 2, 11, 6, 7, 12, 0, 5, 14, 9 );
var S3 = new Array(
	10, 0, 9, 14, 6, 3, 15, 5, 1, 13, 12, 7, 11, 4, 2, 8,
	13, 7, 0, 9, 3, 4, 6, 10, 2, 8, 5, 14, 12, 11, 15, 1,
	13, 6, 4, 9, 8, 15, 3, 0, 11, 1, 2, 12, 5, 10, 14, 7,
	1, 10, 13, 0, 6, 9, 8, 7, 4, 15, 14, 3, 11, 5, 2, 12 );
var S4 = new Array(
	7, 13, 14, 3, 0, 6, 9, 10, 1, 2, 8, 5, 11, 12, 4, 15,
	13, 8, 11, 5, 6, 15, 0, 3, 4, 7, 2, 12, 1, 10, 14, 9,
	10, 6, 9, 0, 12, 11, 7, 13, 15, 1, 3, 14, 5, 2, 8, 4,
	3, 15, 0, 6, 10, 1, 13, 8, 9, 4, 5, 11, 12, 7, 2, 14 );
var S5 = new Array(
	2, 12, 4, 1, 7, 10, 11, 6, 8, 5, 3, 15, 13, 0, 14, 9,
	14, 11, 2, 12, 4, 7, 13, 1, 5, 0, 15, 10, 3, 9, 8, 6,
	4, 2, 1, 11, 10, 13, 7, 8, 15, 9, 12, 5, 6, 3, 0, 14,
	11, 8, 12, 7, 1, 14, 2, 13, 6, 15, 0, 9, 10, 4, 5, 3 );
var S6 = new Array(
	12, 1, 10, 15, 9, 2, 6, 8, 0, 13, 3, 4, 14, 7, 5, 11,
	10, 15, 4, 2, 7, 12, 9, 5, 6, 1, 13, 14, 0, 11, 3, 8,
	9, 14, 15, 5, 2, 8, 12, 3, 7, 0, 4, 10, 1, 13, 11, 6,
	4, 3, 2, 12, 9, 5, 15, 10, 11, 14, 1, 7, 6, 0, 8, 13 );
var S7 = new Array(
	4, 11, 2, 14, 15, 0, 8, 13, 3, 12, 9, 7, 5, 10, 6, 1,
	13, 0, 11, 7, 4, 9, 1, 10, 14, 3, 5, 12, 2, 15, 8, 6,
	1, 4, 11, 13, 12, 3, 7, 14, 10, 15, 6, 8, 0, 5, 9, 2,
	6, 11, 13, 8, 1, 4, 10, 7, 9, 5, 0, 15, 14, 2, 3, 12 );
var S8 = new Array(
	13, 2, 8, 4, 6, 15, 11, 1, 10, 9, 3, 14, 5, 0, 12, 7,
	1, 15, 13, 8, 10, 3, 7, 4, 12, 5, 6, 11, 0, 14, 9, 2,
	7, 11, 4, 1, 9, 12, 14, 2, 0, 6, 10, 13, 15, 3, 5, 8,
	2, 1, 14, 7, 4, 10, 8, 13, 15, 12, 9, 0, 3, 5, 6, 11 );

//Первичное преобразование ключа CD (табл. 5)
var PC_1_perm = new Array( -1, 
	// C
	57, 49, 41, 33, 25, 17, 9, 1, 58, 50, 42, 34, 26, 18,
	10, 2, 59, 51, 43, 35, 27, 19, 11, 3, 60, 52, 44, 36,
	// D
	63, 55, 47, 39, 31, 23, 15, 7, 62, 54, 46, 38, 30, 22,
	14, 6, 61, 53, 45, 37, 29, 21, 13, 5, 28, 20, 12, 4 );

//Выборка ключа (табл. 7)
var PC_2_perm = new Array( -1, 
	14, 17, 11, 24, 1, 5, 3, 28, 15, 6, 21, 10,
	23, 19, 12, 4, 26, 8, 16, 7, 27, 20, 13, 2,
	41, 52, 31, 37, 47, 55, 30, 40, 51, 45, 33, 48,
	44, 49, 39, 56, 34, 53, 46, 42, 50, 36, 29, 32 );

//Удаление пробелов в шестнадцатеричном числе
function remove_spaces(instr)
{
	var i;
	var outstr="";

	for( i=0; i<instr.length; i++ )
		if ( instr.charAt(i) != " " )
			outstr += instr.charAt(i);
	return outstr;
}

//Разбиение числа на биты
// ary   = Массив бит
// start = Начальная позиция
// bitc  = Число битов для преобразования
// val   = Преобразуемое число
function split_int( ary, start, bitc, val )
{
   var i = start;
   var j;
   for( j=bitc-1; j>=0; j-- )
   {
      ary[i+j] = val & 1;
      val >>= 1;
   }
}

function get_value_of_key(bitarray, str, ASCII_flag)
{
	var i=0, val=0;
	bitarray[0] = -1;
	if(ASCII_flag)
	{
		if ( str.length != 8 )
		{
			window.alert("Ключ должн быть длинной 64 бита (16-ти значное шестнадцатеричное число)");
			bitarray[0] = ERROR_VAL;
			return
		}
		for( i=0; i<8; i++ )
		{
			split_int(bitarray, i*8+1, 8, str.charCodeAt(i));
		}
	}
	else
	{
      //Удаляем пробелы
      str = remove_spaces(str);
      if ( str.length != 16 )
      {
         window.alert("Ключ должн быть длинной 64 бита (16-ти значное шестнадцатеричное число)");
         bitarray[0] = ERROR_VAL;
         return;
      }
      for( i=0; i<16; i++ )
      {
         //Выбираем очередной символ для проверки
         val = str.charCodeAt(i);

         if ( val >= 48 && val <= 57 )
            //Число 0-9
            val -= 48;
         else if ( val >= 65 && val <= 70 )
            //Буква A-F (ЗАГЛАВНАЯ)
            val -= 55;
         else if ( val >= 97 && val <= 102 )
            //Буква A-F
            val -= 87;
         else
         {
            window.alert( str.charAt(i)+" - некорректный символ!" );
            bitarray[0] = ERROR_VAL;
            return;
         }
         split_int( bitarray, i*4+1, 4, val);
      }
   }
}

//Считываение информации со странички
function get_value(in_str, ASCII_flag)
{
	str=in_str.slice(0);
	var i=0, j=0;
	var inData;
	var val=0; //Для проверки шестнадцатеричных чисел
	var s=0; //Кол-во символов, не достающее для кратности 8
	var n=0; //Кол-во блоков по 8 бит

	if (ASCII_flag)
	{
		if ((str.length % 8) != 0)
		{
			if (str.length < 8)
			{
				s = 8 - str.length;
				n=1;
			}
			else
			{
				n = Math.ceil(str.length/8); //Округляем до большего целого
				s = 8 - ( str.length - ( 8 * Math.floor(str.length/8) ) ); //Хитро вычисляем какое кол-во символов не достает до кратности 8
			}
			for (i=0; i<s; i++) //Дополняем str
				str+="\0";		
		}
		else
		{
			n=str.length/8;
		}
		inData = new Array (n);
		for (j=0; j<n; j++)
		{
			inData[j] = new Array(65);
			for(i=0; i<8; i++)
				split_int( inData[j], i*8+1, 8, str.charCodeAt(i+8*j) );
		}
   }
   else
   {
		//Удаляем пробелы
		str = remove_spaces(str);
		
		if ( (str.length % 16) != 0 )
		{
			if ( str.length < 16 )
			{
				s = 16 - str.length;
				n=1;
			}
			else
			{
				n = Math.ceil(str.length/16);
				s = 16 - ( str.length - ( 16 * Math.floor(str.length/16) ) ); //Хитро вычисляем какое кол-во символов не достает до кратности 16
			}
			var s0="";
			for (i=0; i<s; i++) //Дополняем str
				s0+="0";
			str=s0+str;	
		}
		else
		{
			n=str.length/16;
		}
		inData = new Array (n);
		for (j=0; j<n; j++)
		{
			inData[j] = new Array(65);
			for( i=0; i<16; i++ )
			{
				val = str.charCodeAt(i+16*j);
				if ( val >= 48 && val <= 57 )
				//Число 0-9
				val -= 48;
				else if ( val >= 65 && val <= 70 )
				//Буква A-F (ЗАГЛАВНАЯ)
				val -= 55;
				else if ( val >= 97 && val <= 102 )
				//Буква A-F
				val -= 87;
				else
				{
					window.alert( str.charAt(i)+" - некорректный символ!" );
					return;
				}
				split_int( inData[j], i*4+1, 4, val);
			}
		}
   }
   return inData;
}

//Преобразуем битовый массив в ASCII or hex
function format_DES_output(DES_output)
{
   var i=0; j=0;
   var bits;
   var str="";

   //1 = ASCII
   //0 = hex
   if ( document.form.output_type[0].checked )
   {
	for(j=0; j<DES_output.length; j++)
	{
      for( i=1; i<=64; i+= 8 )
      {
            str += String.fromCharCode(
                        DES_output[j][i  ]*128 + DES_output[j][i+1]*64  +
                        DES_output[j][i+2]*32  + DES_output[j][i+3]*16  +
                        DES_output[j][i+4]*8   + DES_output[j][i+5]*4   +
                        DES_output[j][i+6]*2   + DES_output[j][i+7] );
      }
	}
   }
   else 
   {
	for(j=0; j<DES_output.length; j++)
	{
      for( i=1; i<=64; i+= 4 )
      {
            bits = DES_output[j][i  ]*8   + DES_output[j][i+1]*4   +
                   DES_output[j][i+2]*2   + DES_output[j][i+3];

            //0-9 or A-F
            if ( bits <= 9 )
               str += String.fromCharCode( bits+48 );
            else
               str += String.fromCharCode( bits+87 );
      }
	}
   }

   //Выводим информацию на страничку
   document.form.output.value = str;
}

//Перестановка битового вектора согласно шаблону
//dest = Преобразованный вектор
//src  = Исходный вектор
//perm = Перестановка
//Игнорируем [0]
//Не используется для S перестановок!
function permute( dest, src, perm )
{
  var i;
  var fromloc;

  for( i=1; i<perm.length; i++ )
  {
    fromloc = perm[i];
    dest[i] = src[fromloc];
  }
}

// XOR
function xor( a1, a2 )
{
   var i;

   for( i=1; i<a1.length; i++ )
      a1[i] = a1[i] ^ a2[i];
}

//S перестановка
function do_S( SBox, index, inbits )
{
   //Из 6 бит получаем десятичное число, это индекс в векторе S
   var S_index = inbits[index  ]*32 + inbits[index+5]*16 +
                 inbits[index+1]*8  + inbits[index+2]*4 +
                 inbits[index+3]*2  + inbits[index+4];
   return SBox[S_index];
}

//Цикл DES шифрования
function des_round( L, R, KeyR )
{
   var E_result = new Array( 49 );
   var S_out = new Array( 33 );

   //new L = old R
   var temp_L = new Array( 33 );
   for( i=0; i<33; i++ )
   {
      temp_L[i] = L[i];
      L[i] = R[i];
   }

   //Функция расширения E (табл. 2)
   permute( E_result, R, E_perm );

   //Сложение по модулю 2 с ключом
   xor( E_result, KeyR );

   //S перестановка
   split_int( S_out,  1, 4, do_S( S1,  1, E_result ) );
   split_int( S_out,  5, 4, do_S( S2,  7, E_result ) );
   split_int( S_out,  9, 4, do_S( S3, 13, E_result ) );
   split_int( S_out, 13, 4, do_S( S4, 19, E_result ) );
   split_int( S_out, 17, 4, do_S( S5, 25, E_result ) );
   split_int( S_out, 21, 4, do_S( S6, 31, E_result ) );
   split_int( S_out, 25, 4, do_S( S7, 37, E_result ) );
   split_int( S_out, 29, 4, do_S( S8, 43, E_result ) );

   //Перестановка P (табл. 4)
   permute( R, S_out, P_perm );

   xor( R, temp_L );
}

//Сдвигаем вектор CD влево на 1 бит
function shift_CD_1( CD )
{
   var i;

   //Используем [0] для временного хранения
   for( i=0; i<=55; i++ )
      CD[i] = CD[i+1];

   //Сдвигаем D
   CD[56] = CD[28];
   //Сдвигаем С
   CD[28] = CD[0];
}

//Сдвигаем вектор CD влево на 2 бита
function shift_CD_2( CD )
{
   var i;
   var C1 = CD[1]; //Понадобится вторая переменная для временного хранения
	
   //Используем [0] для временного хранения
   for( i=0; i<=54; i++ )
      CD[i] = CD[i+2];

   //Сдвигаем D
   CD[55] = CD[27];
   CD[56] = CD[28];
   //Сдвигаем C
   CD[27] = C1;
   CD[28] = CD[0];
}

// DES encryption/decryption
function des_encrypt( inData, Key, encrypt_flag)
{
   var tempData = new Array( 65 );
   var CD = new Array( 57 );		//Матрица CD
   var KS = new Array( 16 );		//Ключи для каждого раунда
   var L = new Array( 33 );
   var R = new Array( 33 );
   var result = new Array(inData.length);
   var i=0, j=0;
   for(i=0; i<result.length; i++)
		result[i] = new Array (65);
	i=0;
	
   //Первичное преобразование ключа матрицей CD (табл. 5)
   permute( CD, Key, PC_1_perm );

   //Создаем ключи для каждого раунда
   for( i=1; i<=16; i++ )
   {
      KS[i] = new Array( 49 );
	  
      // Сдвиг векторов C и D (табл. 6)
      if ( i==1 || i==2 || i==9 || i == 16 )
         shift_CD_1( CD );
      else
         shift_CD_2( CD );

      //Вторичное преобразование ключа (табл. 7)
      permute( KS[i], CD, PC_2_perm );
   }
	for(j=0; j<inData.length; j++)
	{
		//Начальная перестановка (табл. 1)
		permute( tempData, inData[j], IP_perm );

		//Делим входной блок на  L/R
		for( i=1; i<=32; i++ )
		{
			L[i] = tempData[i];
			R[i] = tempData[i+32];
		}

		// encrypt_flag=1 шифрование 
		// encrypt_flag=0 дешифровка
		if (encrypt_flag)
			for( i=1; i<=16; i++ )
				des_round( L, R, KS[i] );
		else
			for( i=16; i>=1; i-- )
				des_round( L, R, KS[i] );

		//Собираем блок из L/R 
		//Блок = 64 бита, R=32, L=32
		for( i=1; i<=32; i++ )
		{
			tempData[i] = R[i];
			tempData[i+32] = L[i];
		}
		//Конечная перестановка (табл. 8)
		permute( result[j], tempData, FP_perm );
	}
	return result;
}

function main(encrypt_flag)
{
   var inData;
   var Key = new Array( 65 );
   var DES_output;
	
   inData = get_value( document.form.input.value, document.form.input_type[0].checked );

   get_value_of_key( Key, document.form.key.value, false);
   if ( Key[0] == ERROR_VAL )
      return;
	  
   DES_output = des_encrypt(inData, Key, encrypt_flag)
   format_DES_output(DES_output);
}


/*
Добавить ASCII ключи:
					<br>
					<input type="radio" name="key_type" checked="checked">ASCII</input>
					<br>
					<input type="radio" name="key_type">Шестнадцатеричное число</input>
					
					
					get_value_of_key( Key, document.form.key.value, document.form.key_type[0].checked);				
*/