
async function start(){await fetch('/start',{method:'POST'})}
async function load(){
 const s=await fetch('/status').then(r=>r.json())
 document.getElementById('status').innerText=`${s.count}/${s.max}`
 const h=await fetch('/history').then(r=>r.json())
 document.getElementById('history').innerHTML=h.map(i=>`<p>${i.comment} → ${i.response}</p>`).join("")
}
setInterval(load,2000);load();
