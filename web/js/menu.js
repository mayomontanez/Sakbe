/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
$(function(){
  $(".accordion-titulo").click(function(e){
           
        e.preventDefault();
    
        var contenido=$(this).next(".accordion-content");

        if(contenido.css("display")=="none"){ //open		
          contenido.slideDown(250);			
          $(this).addClass("open");
        }
        else{ //close		
          contenido.slideUp(250);
          $(this).removeClass("open");	
        }

      });
});

