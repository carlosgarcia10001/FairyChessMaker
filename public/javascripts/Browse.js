$(document).ready(function(){
    $(document).on('load', function(){
        $("a[class='game']").click(function(){
            $.post("/browse",{
                id: $(this).attr('id')
            }).done(function(data){
                window.location.assign("/play/" + data)
            })
        })
    })
    $(document).trigger('load')
})